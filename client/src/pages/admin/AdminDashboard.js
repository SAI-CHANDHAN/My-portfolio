import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    contacts: 0,
    skills: 0,
    recentContacts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [projectsRes, contactsRes, skillsRes] = await Promise.all([
        api.getAdminProjects(),
        api.getContacts(1, 5), // Get recent 5 contacts
        api.getAdminSkills()
      ]);

      setStats({
        projects: projectsRes.projects?.length || 0,
        contacts: contactsRes.totalCount || 0,
        skills: skillsRes.skills?.length || 0,
        recentContacts: contactsRes.contacts?.slice(0, 5) || []
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back! Here's what's happening with your portfolio.</p>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.projects}</h3>
            <p>Total Projects</p>
          </div>
          <Link to="/admin/projects" className="stat-link">
            View All →
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <h3>{stats.skills}</h3>
            <p>Skills</p>
          </div>
          <Link to="/admin/skills" className="stat-link">
            Manage →
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📧</div>
          <div className="stat-content">
            <h3>{stats.contacts}</h3>
            <p>Total Messages</p>
          </div>
          <Link to="/admin/contact" className="stat-link">
            View All →
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>{stats.recentContacts.filter(c => c.status === 'new').length}</h3>
            <p>Unread Messages</p>
          </div>
          <Link to="/admin/contact?filter=new" className="stat-link">
            Read →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/admin/projects/add" className="action-btn primary">
            <span className="btn-icon">➕</span>
            Add New Project
          </Link>
          <Link to="/admin/skills/add" className="action-btn secondary">
            <span className="btn-icon">🛠️</span>
            Add New Skill
          </Link>
          <Link to="/admin/contact" className="action-btn tertiary">
            <span className="btn-icon">📬</span>
            Check Messages
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Messages</h2>
        {stats.recentContacts.length > 0 ? (
          <div className="activity-list">
            {stats.recentContacts.map((contact) => (
              <div key={contact._id} className={`activity-item ${contact.status}`}>
                <div className="activity-content">
                  <h4>{contact.name}</h4>
                  <p className="activity-subject">{contact.subject}</p>
                  <p className="activity-message">
                    {contact.message.substring(0, 100)}
                    {contact.message.length > 100 && '...'}
                  </p>
                </div>
                <div className="activity-meta">
                  <span className="activity-date">
                    {formatDate(contact.createdAt)}
                  </span>
                  <span className={`activity-status status-${contact.status}`}>
                    {contact.status}
                  </span>
                </div>
              </div>
            ))}
            <Link to="/admin/contact" className="view-all-link">
              View All Messages →
            </Link>
          </div>
        ) : (
          <div className="no-activity">
            <p>No recent messages</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;