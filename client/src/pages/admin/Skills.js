import React, { useState, useEffect } from 'react';
import './AdminPages.css';

const AdminSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'frontend',
    level: 'intermediate',
    proficiency: 50,
    icon: '',
    color: '#007bff',
    description: '',
    yearsOfExperience: 0,
    isVisible: true,
    order: 0
  });
  const [editingSkill, setEditingSkill] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, skill: null });

  const categories = [
    'frontend',
    'backend', 
    'database',
    'devops',
    'mobile',
    'design',
    'tools',
    'other'
  ];

  const levels = [
    'beginner',
    'intermediate', 
    'advanced',
    'expert'
  ];

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/skills/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSkills(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch skills');
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/admin/login';
        }
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please log in.');
        return;
      }

      const skillData = editingSkill || newSkill;
      
      // Validate required fields
      if (!skillData.name || !skillData.category) {
        setError('Name and category are required.');
        return;
      }

      const url = editingSkill ? `/api/skills/${editingSkill._id}` : '/api/skills';
      const method = editingSkill ? 'PUT' : 'POST';
      
      console.log('Sending skill data:', skillData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(skillData)
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (response.ok) {
        if (editingSkill) {
          setSkills(skills.map(s => s._id === editingSkill._id ? responseData : s));
          setEditingSkill(null);
          alert('Skill updated successfully!');
        } else {
          setSkills([...skills, responseData]);
          setNewSkill({
            name: '',
            category: 'frontend',
            level: 'intermediate',
            proficiency: 50,
            icon: '',
            color: '#007bff',
            description: '',
            yearsOfExperience: 0,
            isVisible: true,
            order: 0
          });
          alert('Skill added successfully!');
        }
      } else {
        if (responseData.errors) {
          setError(responseData.errors.map(err => err.msg).join(', '));
        } else {
          setError(responseData.message || 'Failed to save skill');
        }
      }
    } catch (error) {
      console.error('Error saving skill:', error);
      setError('Network error. Please try again.');
    }
  };

  const handleEdit = (skill) => {
    setEditingSkill({ ...skill });
  };

  const handleCancelEdit = () => {
    setEditingSkill(null);
    setError(null);
  };

  const handleDelete = async (skillId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSkills(skills.filter(s => s._id !== skillId));
        setDeleteModal({ show: false, skill: null });
        alert('Skill deleted successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete skill');
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
      setError('Network error. Please try again.');
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return 'level-beginner';
      case 'intermediate': return 'level-intermediate';
      case 'advanced': return 'level-advanced';
      case 'expert': return 'level-expert';
      default: return 'level-intermediate';
    }
  };

  const getLevelWidth = (level) => {
    switch (level) {
      case 'beginner': return '25%';
      case 'intermediate': return '50%';
      case 'advanced': return '75%';
      case 'expert': return '100%';
      default: return '50%';
    }
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const SkillCard = ({ skill }) => (
    <div className="skill-card">
      <div className="skill-header">
        <div className="skill-info">
          {skill.icon && <span className="skill-icon">{skill.icon}</span>}
          <h4 className="skill-name">{skill.name}</h4>
          {skill.description && <p className="skill-description">{skill.description}</p>}
        </div>
        <div className="skill-actions">
          <button 
            onClick={() => handleEdit(skill)}
            className="btn btn-sm btn-primary"
          >
            Edit
          </button>
          <button 
            onClick={() => setDeleteModal({ show: true, skill })}
            className="btn btn-sm btn-danger"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="skill-level">
        <div className="level-bar">
          <div 
            className={`level-fill ${getLevelColor(skill.level)}`}
            style={{ 
              width: skill.proficiency ? `${skill.proficiency}%` : getLevelWidth(skill.level),
              backgroundColor: skill.color || '#007bff'
            }}
          ></div>
        </div>
        <span className="level-text">
          {skill.level} {skill.proficiency && `(${skill.proficiency}%)`}
        </span>
      </div>
      
      {skill.yearsOfExperience > 0 && (
        <div className="skill-experience">
          {skill.yearsOfExperience} year{skill.yearsOfExperience !== 1 ? 's' : ''} experience
        </div>
      )}
    </div>
  );

  const SkillForm = ({ skill, onSubmit, onCancel, isEditing }) => (
    <form onSubmit={onSubmit} className="skill-form">
      <div className="form-row">
        <div className="form-group">
          <label>Skill Name *</label>
          <input
            type="text"
            placeholder="e.g., React, Node.js, MongoDB"
            value={skill.name}
            onChange={(e) => {
              if (isEditing) {
                setEditingSkill({ ...skill, name: e.target.value });
              } else {
                setNewSkill({ ...skill, name: e.target.value });
              }
            }}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Category *</label>
          <select
            value={skill.category}
            onChange={(e) => {
              if (isEditing) {
                setEditingSkill({ ...skill, category: e.target.value });
              } else {
                setNewSkill({ ...skill, category: e.target.value });
              }
            }}
            required
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Level</label>
          <select
            value={skill.level}
            onChange={(e) => {
              if (isEditing) {
                setEditingSkill({ ...skill, level: e.target.value });
              } else {
                setNewSkill({ ...skill, level: e.target.value });
              }
            }}
          >
            {levels.map(level => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Proficiency (0-100)</label>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="50"
            value={skill.proficiency || ''}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              if (isEditing) {
                setEditingSkill({ ...skill, proficiency: value });
              } else {
                setNewSkill({ ...skill, proficiency: value });
              }
            }}
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Icon</label>
          <input
            type="text"
            placeholder="⚛️ or fa-react"
            value={skill.icon || ''}
            onChange={(e) => {
              if (isEditing) {
                setEditingSkill({ ...skill, icon: e.target.value });
              } else {
                setNewSkill({ ...skill, icon: e.target.value });
              }
            }}
          />
        </div>
        
        <div className="form-group">
          <label>Color</label>
          <input
            type="color"
            value={skill.color || '#007bff'}
            onChange={(e) => {
              if (isEditing) {
                setEditingSkill({ ...skill, color: e.target.value });
              } else {
                setNewSkill({ ...skill, color: e.target.value });
              }
            }}
          />
        </div>
        
        <div className="form-group">
          <label>Years of Experience</label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={skill.yearsOfExperience || ''}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              if (isEditing) {
                setEditingSkill({ ...skill, yearsOfExperience: value });
              } else {
                setNewSkill({ ...skill, yearsOfExperience: value });
              }
            }}
          />
        </div>
      </div>
      
      <div className="form-group">
        <label>Description</label>
        <textarea
          placeholder="Brief description of your experience with this skill..."
          value={skill.description || ''}
          onChange={(e) => {
            if (isEditing) {
              setEditingSkill({ ...skill, description: e.target.value });
            } else {
              setNewSkill({ ...skill, description: e.target.value });
            }
          }}
          rows="2"
        />
      </div>
      
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {isEditing ? 'Update Skill' : 'Add Skill'}
        </button>
        {isEditing && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading">Loading skills...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Skills Management</h1>
        <p>Manage your technical skills and proficiency levels</p>
      </div>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => setError(null)} className="btn btn-sm">×</button>
        </div>
      )}

      <div className="content-section">
        <h2>Add New Skill</h2>
        <SkillForm
          skill={newSkill}
          onSubmit={handleSubmit}
          isEditing={false}
        />
      </div>

      {editingSkill && (
        <div className="content-section">
          <h2>Edit Skill</h2>
          <SkillForm
            skill={editingSkill}
            onSubmit={handleSubmit}
            onCancel={handleCancelEdit}
            isEditing={true}
          />
        </div>
      )}

      <div className="content-section">
        <h2>Skills Overview ({skills.length} total)</h2>
        
        {skills.length === 0 ? (
          <div className="empty-state">
            <p>No skills added yet. Add your first skill above!</p>
          </div>
        ) : (
          Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="skill-category">
              <h3 className="category-title">
                {category.charAt(0).toUpperCase() + category.slice(1)} 
                <span className="skill-count">({categorySkills.length})</span>
              </h3>
              <div className="skills-grid">
                {categorySkills.map(skill => (
                  <SkillCard key={skill._id} skill={skill} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the skill "{deleteModal.skill?.name}"?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => handleDelete(deleteModal.skill._id)}
                className="btn btn-danger"
              >
                Delete
              </button>
              <button 
                onClick={() => setDeleteModal({ show: false, skill: null })}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSkills;