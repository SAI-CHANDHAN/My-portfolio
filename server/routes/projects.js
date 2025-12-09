const express = require('express');
const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const { validateProject, validateId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Get all projects (public)
router.get('/', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { category, featured, search, exclude } = req.query;
    
    // Build query
    let query = { isPublished: true };
    
    if (category) {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Add exclude functionality for related projects
    if (exclude) {
      query._id = { $ne: exclude };
    }

    const projects = await Project.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Project.countDocuments(query);
    
    res.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured projects (public)
router.get('/featured', async (req, res) => {
  try {
    const projects = await Project.find({ 
      isPublished: true, 
      isFeatured: true 
    })
    .sort({ priority: -1, createdAt: -1 })
    .limit(6)
    .lean();

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get project by ID or slug (public)
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is MongoDB ObjectId or slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const query = isObjectId ? { _id: identifier } : { slug: identifier };
    query.isPublished = true;

    const project = await Project.findOne(query).lean();
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Return project directly (matches frontend expectation after fix)
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project (admin only)
router.post('/', [auth, ...validateProject], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = new Project(req.body);
    await project.save();

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Project with this title already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project (admin only)
router.put('/:id', [auth, validateId, ...validateProject], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Project with this title already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project (admin only)
router.delete('/:id', [auth, validateId], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all projects for admin
router.get('/admin/all', auth, async (req, res) => {
  try {
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
