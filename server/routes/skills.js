// server/routes/skills.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Skill = require('../models/Skill');

// Validation middleware function
const validation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// @route   GET /api/skills
// @desc    Get all skills (with optional category filter and sorting)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, sort = 'name' } = req.query;

    let query = { isVisible: true }; // Only show visible skills by default
    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Fetch skills, sort by the specified field, and return
    const skills = await Skill.find(query).sort({ order: 1, [sort]: 1 }); // Sort by order first, then by specified field

    res.json(skills);
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ message: 'Server error while fetching skills' });
  }
});

// @route   GET /api/skills/categories
// @desc    Get all unique skill categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Skill.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
});

// @route   GET /api/skills/admin/all
// @desc    Get all skills for admin (including hidden ones)
// @access  Private (Admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const skills = await Skill.find().sort({ category: 1, order: 1, name: 1 });
    res.json(skills);
  } catch (error) {
    console.error('Get all skills for admin error:', error);
    res.status(500).json({ message: 'Server error while fetching all skills' });
  }
});

// @route   GET /api/skills/:id
// @desc    Get a single skill by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.json(skill);
  } catch (error) {
    console.error('Get skill by ID error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Skill not found with provided ID' });
    }
    res.status(500).json({ message: 'Server error while fetching skill by ID' });
  }
});

// @route   POST /api/skills
// @desc    Create a new skill
// @access  Private (Admin only)
router.post(
  '/',
  [
    auth,
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required')
      .isIn(['frontend', 'backend', 'database', 'devops', 'mobile', 'design', 'tools', 'other'])
      .withMessage('Category must be one of: frontend, backend, database, devops, mobile, design, tools, other'),
    body('level')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
      .withMessage('Level must be one of: beginner, intermediate, advanced, expert'),
    body('proficiency')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Proficiency must be an integer between 0 and 100'),
    body('icon').optional().trim(),
    body('color').optional().trim(),
    body('description').optional().trim(),
    body('yearsOfExperience')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Years of experience must be a positive integer'),
    body('isVisible')
      .optional()
      .isBoolean()
      .withMessage('isVisible must be a boolean'),
    body('order')
      .optional()
      .isInt()
      .withMessage('Order must be an integer'),
    validation,
  ],
  async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required to create skills' });
      }

      const {
        name,
        category,
        level,
        proficiency,
        icon,
        color,
        description,
        yearsOfExperience,
        isVisible,
        order
      } = req.body;

      // Check if a skill with the same name and category already exists
      const existingSkill = await Skill.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        category: { $regex: new RegExp(`^${category}$`, 'i') }
      });

      if (existingSkill) {
        return res.status(400).json({ message: 'Skill with this name already exists in this category' });
      }

      // Create new skill object
      const skillData = {
        name,
        category,
      };

      // Add optional fields if provided
      if (level !== undefined) skillData.level = level;
      if (proficiency !== undefined) skillData.proficiency = proficiency;
      if (icon !== undefined) skillData.icon = icon;
      if (color !== undefined) skillData.color = color;
      if (description !== undefined) skillData.description = description;
      if (yearsOfExperience !== undefined) skillData.yearsOfExperience = yearsOfExperience;
      if (isVisible !== undefined) skillData.isVisible = isVisible;
      if (order !== undefined) skillData.order = order;

      const skill = new Skill(skillData);
      await skill.save();

      res.status(201).json(skill);
    } catch (error) {
      console.error('Create skill error:', error);
      res.status(500).json({ message: 'Server error while creating skill' });
    }
  }
);

// @route   PUT /api/skills/:id
// @desc    Update an existing skill by ID
// @access  Private (Admin only)
router.put(
  '/:id',
  [
    auth,
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('category')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Category cannot be empty')
      .isIn(['frontend', 'backend', 'database', 'devops', 'mobile', 'design', 'tools', 'other'])
      .withMessage('Category must be one of: frontend, backend, database, devops, mobile, design, tools, other'),
    body('level')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
      .withMessage('Level must be one of: beginner, intermediate, advanced, expert'),
    body('proficiency')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Proficiency must be an integer between 0 and 100'),
    body('icon').optional().trim(),
    body('color').optional().trim(),
    body('description').optional().trim(),
    body('yearsOfExperience')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Years of experience must be a positive integer'),
    body('isVisible')
      .optional()
      .isBoolean()
      .withMessage('isVisible must be a boolean'),
    body('order')
      .optional()
      .isInt()
      .withMessage('Order must be an integer'),
    validation,
  ],
  async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required to update skills' });
      }

      const {
        name,
        category,
        level,
        proficiency,
        icon,
        color,
        description,
        yearsOfExperience,
        isVisible,
        order
      } = req.body;

      let skill = await Skill.findById(req.params.id);

      if (!skill) {
        return res.status(404).json({ message: 'Skill not found' });
      }

      // If name or category is being changed, check for duplicates
      if (name !== undefined || category !== undefined) {
        const checkName = name || skill.name;
        const checkCategory = category || skill.category;

        const existingSkill = await Skill.findOne({
          _id: { $ne: req.params.id },
          name: { $regex: new RegExp(`^${checkName}$`, 'i') },
          category: { $regex: new RegExp(`^${checkCategory}$`, 'i') }
        });

        if (existingSkill) {
          return res.status(400).json({ message: 'Another skill with this name exists in this category' });
        }
      }

      // Update skill fields
      if (name !== undefined) skill.name = name;
      if (category !== undefined) skill.category = category;
      if (level !== undefined) skill.level = level;
      if (proficiency !== undefined) skill.proficiency = proficiency;
      if (icon !== undefined) skill.icon = icon;
      if (color !== undefined) skill.color = color;
      if (description !== undefined) skill.description = description;
      if (yearsOfExperience !== undefined) skill.yearsOfExperience = yearsOfExperience;
      if (isVisible !== undefined) skill.isVisible = isVisible;
      if (order !== undefined) skill.order = order;

      await skill.save();
      res.json(skill);
    } catch (error) {
      console.error('Update skill error:', error);
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Skill not found with provided ID' });
      }
      res.status(500).json({ message: 'Server error while updating skill' });
    }
  }
);

// @route   DELETE /api/skills/:id
// @desc    Delete a skill by ID
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required to delete skills' });
    }

    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete skill error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Skill not found with provided ID' });
    }
    res.status(500).json({ message: 'Server error while deleting skill' });
  }
});

// @route   POST /api/skills/bulk
// @desc    Create multiple skills at once
// @access  Private (Admin only)
router.post('/bulk', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required for bulk skill creation' });
    }

    const { skills } = req.body;

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ message: 'An array of skills is required for bulk creation' });
    }

    // Validate each skill
    for (const skill of skills) {
      if (!skill.name || !skill.category) {
        return res.status(400).json({
          message: 'Each skill must have a name and category',
          invalidSkill: skill
        });
      }
      
      // Trim strings
      if (typeof skill.name === 'string') skill.name = skill.name.trim();
      if (typeof skill.category === 'string') skill.category = skill.category.trim();
      if (typeof skill.icon === 'string') skill.icon = skill.icon.trim();
      if (typeof skill.description === 'string') skill.description = skill.description.trim();
      if (typeof skill.color === 'string') skill.color = skill.color.trim();
      
      // Validate proficiency range
      if (skill.proficiency !== undefined && (skill.proficiency < 0 || skill.proficiency > 100)) {
        return res.status(400).json({
          message: 'Skill proficiency must be between 0 and 100',
          invalidSkill: skill
        });
      }
    }

    const createdSkills = await Skill.insertMany(skills, { ordered: false });
    res.status(201).json(createdSkills);
  } catch (error) {
    console.error('Bulk create skills error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'One or more skills already exist', 
        details: error.message 
      });
    }
    res.status(500).json({ message: 'Server error during bulk skill creation' });
  }
});

module.exports = router;