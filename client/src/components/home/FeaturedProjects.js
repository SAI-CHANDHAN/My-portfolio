import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../utils/api';
import './FeaturedProjects.css';

const FeaturedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchFeaturedProjects();
  }, []);

  const fetchFeaturedProjects = async () => {
    try {
      // Use the dedicated featured projects endpoint
      const data = await apiService.request('/projects/featured');
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching featured projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="featured-projects">
        <div className="container">
          <h2>Featured Projects</h2>
          <div className="loading-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="project-card-skeleton">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-projects" id="projects">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Featured Projects</h2>
          <p className="section-subtitle">
            Here are some of my recent works that showcase my skills and experience
          </p>
        </div>
        
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div key={project._id} className={`project-card ${index === 1 ? 'featured' : ''}`}>
              <div className="project-image">
                <img 
                  src={project.images?.[0] || '/api/placeholder/400/300'} 
                  alt={project.title}
                  onError={(e) => {
                    e.target.src = '/api/placeholder/400/300';
                  }}
                />
                <div className="project-overlay">
                  <div className="project-links">
                    {project.liveUrl && (
                      <a 
                        href={project.liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="project-link"
                        title="View Live"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m18 13 6-6-6-6"/>
                          <path d="M2 5h12"/>
                        </svg>
                      </a>
                    )}
                    {project.githubUrl && (
                      <a 
                        href={project.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="project-link"
                        title="View Code"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.shortDescription || project.description}</p>
                
                <div className="project-technologies">
                  {project.technologies?.slice(0, 4).map((tech, i) => (
                    <span key={i} className="tech-tag">{tech}</span>
                  ))}
                  {project.technologies?.length > 4 && (
                    <span className="tech-tag more">+{project.technologies.length - 4}</span>
                  )}
                </div>
                
                <Link 
                  to={`/projects/${project._id}`} 
                  className="project-details-link"
                >
                  Learn More →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="no-projects">
            <div className="no-projects-content">
              <h3>No Featured Projects Yet</h3>
              <p>Featured projects will appear here once they are added to the portfolio.</p>
              <Link to="/projects" className="btn btn-primary">
                View All Projects
              </Link>
            </div>
          </div>
        )}
        
        {projects.length > 0 && (
          <div className="view-all-projects">
            <Link to="/projects" className="btn btn-outline">
              View All Projects
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProjects;