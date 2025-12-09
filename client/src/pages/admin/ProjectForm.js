import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AdminPages.css';

const ProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For editing existing project
  const isEdit = Boolean(id);

  const [project, setProject] = useState({
    title: '',
    description: '',
    shortDescription: '',
    technologies: [],
    liveUrl: '',
    githubUrl: '',
    images: [],
    featured: false,
    status: 'completed',
    category: 'web',
    startDate: '',
    endDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [imageInput, setImageInput] = useState('');

  const categories = [
    'web',
    'mobile',
    'desktop',
    'api',
    'library',
    'tool',
    'game',
    'other'
  ];

  const statuses = [
    'planning',
    'in-progress',
    'completed',
    'on-hold',
    'cancelled'
  ];

  useEffect(() => {
    if (isEdit) {
      fetchProject();
    }
  }, [id, isEdit]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProject({
          ...data.project,
          startDate: data.project.startDate ? new Date(data.project.startDate).toISOString().split('T')[0] : '',
          endDate: data.project.endDate ? new Date(data.project.endDate).toISOString().split('T')[0] : ''
        });
      } else {
        alert('Failed to fetch project data');
        navigate('/admin/projects');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      alert('Error fetching project data');
      navigate('/admin/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEdit ? `/api/projects/${id}` : '/api/projects';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(project)
      });

      if (response.ok) {
        alert(`Project ${isEdit ? 'updated' : 'created'} successfully!`);
        navigate('/admin/projects');
      } else {
        const errorData = await response.json();
        alert(`Failed to ${isEdit ? 'update' : 'create'} project: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert(`Error ${isEdit ? 'updating' : 'creating'} project`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProject(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addTechnology = () => {
    if (techInput.trim() && !project.technologies.includes(techInput.trim())) {
      setProject(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const removeTechnology = (tech) => {
    setProject(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const addImage = () => {
    if (imageInput.trim() && !project.images.includes(imageInput.trim())) {
      setProject(prev => ({
        ...prev,
        images: [...prev.images, imageInput.trim()]
      }));
      setImageInput('');
    }
  };

  const removeImage = (img) => {
    setProject(prev => ({
      ...prev,
      images: prev.images.filter(i => i !== img)
    }));
  };

  if (loading && isEdit) {
    return (
      <div className="admin-page">
        <div className="loading">Loading project data...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>{isEdit ? 'Edit Project' : 'Create New Project'}</h1>
        <button
          type="button"
          onClick={() => navigate('/admin/projects')}
          className="btn btn-secondary"
        >
          Back to Projects
        </button>
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Project Title *</label>
              <input
                type="text"
                name="title"
                value={project.title}
                onChange={handleInputChange}
                required
                placeholder="Enter project title"
              />
            </div>
            
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={project.category}
                onChange={handleInputChange}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Short Description *</label>
            <input
              type="text"
              name="shortDescription"
              value={project.shortDescription}
              onChange={handleInputChange}
              required
              placeholder="Brief description for project cards"
              maxLength={150}
            />
            <small>{project.shortDescription.length}/150 characters</small>
          </div>

          <div className="form-group">
            <label>Full Description *</label>
            <textarea
              name="description"
              value={project.description}
              onChange={handleInputChange}
              required
              rows={6}
              placeholder="Detailed project description, features, challenges, etc."
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Technologies</h2>
          
          <div className="tech-input-group">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="Add technology (e.g., React, Node.js)"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
            />
            <button type="button" onClick={addTechnology} className="btn btn-primary">
              Add
            </button>
          </div>
          
          <div className="tech-tags">
            {project.technologies.map(tech => (
              <span key={tech} className="tech-tag">
                {tech}
                <button
                  type="button"
                  onClick={() => removeTechnology(tech)}
                  className="tech-remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Links</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Live URL</label>
              <input
                type="url"
                name="liveUrl"
                value={project.liveUrl}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>
            
            <div className="form-group">
              <label>GitHub URL</label>
              <input
                type="url"
                name="githubUrl"
                value={project.githubUrl}
                onChange={handleInputChange}
                placeholder="https://github.com/username/repo"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Images</h2>
          
          <div className="image-input-group">
            <input
              type="url"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              placeholder="Add image URL"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
            />
            <button type="button" onClick={addImage} className="btn btn-primary">
              Add Image
            </button>
          </div>
          
          <div className="image-preview-grid">
            {project.images.map((img, index) => (
              <div key={index} className="image-preview">
                <img src={img} alt={`Preview ${index + 1}`} />
                <button
                  type="button"
                  onClick={() => removeImage(img)}
                  className="image-remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Project Details</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={project.status}
                onChange={handleInputChange}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="featured"
                  checked={project.featured}
                  onChange={handleInputChange}
                />
                Featured Project
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={project.startDate}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={project.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-large"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/admin/projects')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;