import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AdminPages.css';

const BlogForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For editing existing blog post
  const isEdit = Boolean(id);

  const [post, setPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: [],
    category: 'web-development',
    featuredImage: '',
    published: false,
    publishedAt: '',
    readTime: 5
  });

  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const categories = [
    'web-development',
    'javascript',
    'react',
    'node-js',
    'css',
    'html',
    'database',
    'devops',
    'mobile',
    'ui-ux',
    'career',
    'tutorials',
    'tips-tricks',
    'tools',
    'other'
  ];

  useEffect(() => {
    if (isEdit) {
      fetchPost();
    }
  }, [id, isEdit]);

  useEffect(() => {
    // Calculate word count and estimated read time
    const words = post.content.trim().split(/\s+/).length;
    setWordCount(words);
    
    // Average reading speed is 200-250 words per minute
    const estimatedReadTime = Math.max(1, Math.ceil(words / 225));
    setPost(prev => ({ ...prev, readTime: estimatedReadTime }));
  }, [post.content]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPost({
          ...data.post,
          publishedAt: data.post.publishedAt ? 
            new Date(data.post.publishedAt).toISOString().split('T')[0] : ''
        });
      } else {
        alert('Failed to fetch blog post data');
        navigate('/admin/blog');
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      alert('Error fetching blog post data');
      navigate('/admin/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEdit ? `/api/blog/${id}` : '/api/blog';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(post)
      });

      if (response.ok) {
        alert(`Blog post ${isEdit ? 'updated' : 'created'} successfully!`);
        navigate('/admin/blog');
      } else {
        const errorData = await response.json();
        alert(`Failed to ${isEdit ? 'update' : 'create'} blog post: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert(`Error ${isEdit ? 'updating' : 'creating'} blog post`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPost(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !post.tags.includes(tagInput.trim().toLowerCase())) {
      setPost(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const generateExcerpt = () => {
    const sentences = post.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const excerpt = sentences.slice(0, 2).join('. ').trim();
    setPost(prev => ({
      ...prev,
      excerpt: excerpt.length > 200 ? excerpt.substring(0, 200) + '...' : excerpt + '.'
    }));
  };

  if (loading && isEdit) {
    return (
      <div className="admin-page">
        <div className="loading">Loading blog post data...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>{isEdit ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
        <div className="header-actions">
          <div className="word-count">
            {wordCount} words • {post.readTime} min read
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/blog')}
            className="btn btn-secondary"
          >
            Back to Blog
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="blog-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={post.title}
              onChange={handleInputChange}
              required
              placeholder="Enter blog post title"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={post.category}
                onChange={handleInputChange}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Featured Image URL</label>
              <input
                type="url"
                name="featuredImage"
                value={post.featuredImage}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {post.featuredImage && (
            <div className="image-preview">
              <img src={post.featuredImage} alt="Featured" />
            </div>
          )}
        </div>

        <div className="form-section">
          <h2>Content</h2>
          
          <div className="form-group">
            <label>Content *</label>
            <textarea
              name="content"
              value={post.content}
              onChange={handleInputChange}
              required
              rows={20}
              placeholder="Write your blog post content here... (Supports Markdown)"
              className="content-textarea"
            />
            <small>Supports Markdown formatting</small>
          </div>

          <div className="form-group">
            <label>
              Excerpt
              <button
                type="button"
                onClick={generateExcerpt}
                className="btn btn-sm btn-secondary"
                style={{ marginLeft: '10px' }}
              >
                Auto-generate
              </button>
            </label>
            <textarea
              name="excerpt"
              value={post.excerpt}
              onChange={handleInputChange}
              rows={3}
              placeholder="Brief description for blog post previews"
              maxLength={300}
            />
            <small>{post.excerpt.length}/300 characters</small>
          </div>
        </div>

        <div className="form-section">
          <h2>Tags</h2>
          
          <div className="tag-input-group">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tag (e.g., javascript, tutorial)"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <button type="button" onClick={addTag} className="btn btn-primary">
              Add Tag
            </button>
          </div>
          
          <div className="tag-list">
            {post.tags.map(tag => (
              <span key={tag} className="tag">
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="tag-remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Publishing</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="published"
                  checked={post.published}
                  onChange={handleInputChange}
                />
                Published
              </label>
              <small>Uncheck to save as draft</small>
            </div>
            
            <div className="form-group">
              <label>Publish Date</label>
              <input
                type="date"
                name="publishedAt"
                value={post.publishedAt}
                onChange={handleInputChange}
              />
              <small>Leave empty to use current date when published</small>
            </div>
          </div>

          <div className="form-group">
            <label>Estimated Read Time (minutes)</label>
            <input
              type="number"
              name="readTime"
              value={post.readTime}
              onChange={handleInputChange}
              min="1"
              max="60"
            />
            <small>Automatically calculated based on word count</small>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-large"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Post' : 'Create Post'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/admin/blog')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          
          {!post.published && (
            <button
              type="button"
              onClick={() => {
                setPost(prev => ({ ...prev, published: true }));
                setTimeout(() => document.querySelector('form').requestSubmit(), 100);
              }}
              disabled={loading}
              className="btn btn-success"
            >
              Publish Now
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BlogForm;