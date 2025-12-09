// src/pages/ProjectDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProject();
    trackProjectView();
  }, [id]);

  const fetchProject = async () => {
    try {
      const [projectRes, relatedRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch(`/api/projects?limit=3&exclude=${id}`)
      ]);

      if (!projectRes.ok) {
        throw new Error('Project not found');
      }

      const projectData = await projectRes.json();
      const relatedData = await relatedRes.json();

      // Fixed: Remove .project since API returns project directly
      setProject(projectData);
      setRelatedProjects(relatedData.projects || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const trackProjectView = async () => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'project_view',
          projectId: id,
          timestamp: new Date()
        })
      });
    } catch (error) {
      // Analytics tracking failure shouldn't break the page
      console.warn('Failed to track project view:', error);
    }
  };

  const nextImage = () => {
    if (project && project.images && project.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === project.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (project && project.images && project.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? project.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="error-page">
        <h1>Project Not Found</h1>
        <p>{error}</p>
        <Link to="/projects" className="btn btn-primary">
          View All Projects
        </Link>
      </div>
    );
  }

  // Add null check to ensure project exists before rendering
  if (!project) {
    return (
      <div className="error-page">
        <h1>Project Not Found</h1>
        <p>The requested project could not be loaded.</p>
        <Link to="/projects" className="btn btn-primary">
          View All Projects
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${project.title} - Portfolio`}
        description={project.description}
        image={project.images?.[0]}
      />
      
      <div className="project-detail">
        {/* Hero Section */}
        <section className="project-hero">
          <div className="container">
            <div className="breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <Link to="/projects">Projects</Link>
              <span>/</span>
              <span>{project.title}</span>
            </div>
            
            <h1 className="project-title">{project.title}</h1>
            <p className="project-subtitle">{project.description}</p>
            
            <div className="project-links">
              {project.liveUrl && (
                <a 
                  href={project.liveUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m18 13 6-6-6-6"/>
                    <path d="M2 5h12"/>
                  </svg>
                  View Live Site
                </a>
              )}
              {project.githubUrl && (
                <a 
                  href={project.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                  </svg>
                  View Code
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Image Gallery */}
        {project.images && project.images.length > 0 && (
          <section className="project-gallery">
            <div className="container">
              <div className="gallery-main">
                <div className="main-image">
                  <img 
                    src={project.images[currentImageIndex]} 
                    alt={`${project.title} - Image ${currentImageIndex + 1}`}
                  />
                  {project.images.length > 1 && (
                    <>
                      <button className="gallery-nav prev" onClick={prevImage}>
                        ‹
                      </button>
                      <button className="gallery-nav next" onClick={nextImage}>
                        ›
                      </button>
                    </>
                  )}
                </div>
                
                {project.images.length > 1 && (
                  <div className="gallery-thumbnails">
                    {project.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${project.title} - Thumbnail ${index + 1}`}
                        className={index === currentImageIndex ? 'active' : ''}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Project Details */}
        <section className="project-content">
          <div className="container">
            <div className="content-grid">
              <div className="main-content">
                <div className="project-description">
                  <h2>About This Project</h2>
                  <div 
                    className="description-content"
                    dangerouslySetInnerHTML={{ __html: project.longDescription || project.description }}
                  />
                </div>

                {project.features && project.features.length > 0 && (
                  <div className="project-features">
                    <h3>Key Features</h3>
                    <ul>
                      {project.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.challenges && (
                  <div className="project-challenges">
                    <h3>Challenges & Solutions</h3>
                    <p>{project.challenges}</p>
                  </div>
                )}
              </div>

              <div className="project-sidebar">
                <div className="project-info">
                  <h3>Project Info</h3>
                  
                  <div className="info-item">
                    <strong>Technologies</strong>
                    <div className="tech-tags">
                      {project.technologies?.map((tech, index) => (
                        <span key={index} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </div>

                  {project.duration && (
                    <div className="info-item">
                      <strong>Duration</strong>
                      <span>{project.duration}</span>
                    </div>
                  )}

                  {project.role && (
                    <div className="info-item">
                      <strong>Role</strong>
                      <span>{project.role}</span>
                    </div>
                  )}

                  <div className="info-item">
                    <strong>Completed</strong>
                    <span>{new Date(project.completedAt || project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section className="related-projects">
            <div className="container">
              <h2>Other Projects</h2>
              <div className="related-grid">
                {relatedProjects.map(relatedProject => (
                  <Link 
                    key={relatedProject._id}
                    to={`/projects/${relatedProject._id}`}
                    className="related-project-card"
                  >
                    <div className="related-image">
                      <img 
                        src={relatedProject.images?.[0] || '/api/placeholder/300/200'} 
                        alt={relatedProject.title}
                      />
                    </div>
                    <div className="related-content">
                      <h3>{relatedProject.title}</h3>
                      <p>{relatedProject.description}</p>
                      <div className="related-tech">
                        {relatedProject.technologies?.slice(0, 3).map((tech, i) => (
                          <span key={i} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="project-cta">
          <div className="container">
            <div className="cta-content">
              <h2>Interested in working together?</h2>
              <p>I'm always open to discussing new opportunities and interesting projects.</p>
              <Link to="/contact" className="btn btn-primary">
                Get In Touch
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ProjectDetail;
