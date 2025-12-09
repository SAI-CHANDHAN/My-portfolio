import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './AdminPages.css';

const AdminContact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchContacts();
  }, [currentPage, filter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await api.getContacts(currentPage, 10);
      
      // Handle the response structure correctly
      setContacts(response.contacts || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
      
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (contactId, newStatus) => {
    try {
      await api.updateContactStatus(contactId, newStatus);
      
      // Update local state
      setContacts(prevContacts =>
        prevContacts.map(contact =>
          contact._id === contactId
            ? { ...contact, status: newStatus, isRead: newStatus !== 'new' }
            : contact
        )
      );

      // Update selected contact if it's the one being changed
      if (selectedContact && selectedContact._id === contactId) {
        setSelectedContact(prev => ({
          ...prev,
          status: newStatus,
          isRead: newStatus !== 'new'
        }));
      }

    } catch (error) {
      console.error('Error updating contact status:', error);
      alert('Failed to update contact status');
    }
  };

  const filteredContacts = contacts.filter(contact => {
    if (filter === 'all') return true;
    return contact.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#e74c3c';
      case 'read': return '#f39c12';
      case 'replied': return '#2ecc71';
      case 'archived': return '#95a5a6';
      default: return '#3498db';
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
      <div className="admin-page">
        <div className="loading">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Contact Messages</h1>
        <div className="page-stats">
          <span>Total: {totalCount}</span>
          <span>New: {contacts.filter(c => c.status === 'new').length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All ({contacts.length})
        </button>
        <button 
          className={filter === 'new' ? 'active' : ''}
          onClick={() => setFilter('new')}
        >
          New ({contacts.filter(c => c.status === 'new').length})
        </button>
        <button 
          className={filter === 'read' ? 'active' : ''}
          onClick={() => setFilter('read')}
        >
          Read ({contacts.filter(c => c.status === 'read').length})
        </button>
        <button 
          className={filter === 'replied' ? 'active' : ''}
          onClick={() => setFilter('replied')}
        >
          Replied ({contacts.filter(c => c.status === 'replied').length})
        </button>
      </div>

      {/* Contacts List */}
      <div className="contacts-container">
        <div className="contacts-list">
          {filteredContacts.length > 0 ? (
            filteredContacts.map(contact => (
              <div 
                key={contact._id} 
                className={`contact-item ${!contact.isRead ? 'unread' : ''} ${
                  selectedContact && selectedContact._id === contact._id ? 'selected' : ''
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="contact-header">
                  <h3>{contact.name}</h3>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(contact.status) }}
                  >
                    {contact.status}
                  </span>
                </div>
                <p className="contact-email">{contact.email}</p>
                <p className="contact-subject">{contact.subject}</p>
                <p className="contact-preview">
                  {contact.message.substring(0, 100)}...
                </p>
                <div className="contact-meta">
                  <span>{formatDate(contact.createdAt)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-contacts">
              <p>No contacts found for the selected filter.</p>
            </div>
          )}
        </div>

        {/* Contact Detail */}
        {selectedContact && (
          <div className="contact-detail">
            <div className="detail-header">
              <h2>{selectedContact.name}</h2>
              <div className="detail-actions">
                <select
                  value={selectedContact.status}
                  onChange={(e) => handleStatusChange(selectedContact._id, e.target.value)}
                  className="status-select"
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
                <button 
                  onClick={() => setSelectedContact(null)}
                  className="close-btn"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="detail-content">
              <div className="detail-field">
                <label>Email:</label>
                <p>{selectedContact.email}</p>
              </div>
              
              <div className="detail-field">
                <label>Subject:</label>
                <p>{selectedContact.subject}</p>
              </div>
              
              <div className="detail-field">
                <label>Message:</label>
                <div className="message-content">
                  {selectedContact.message}
                </div>
              </div>
              
              <div className="detail-field">
                <label>Received:</label>
                <p>{formatDate(selectedContact.createdAt)}</p>
              </div>

              {selectedContact.ipAddress && (
                <div className="detail-field">
                  <label>IP Address:</label>
                  <p>{selectedContact.ipAddress}</p>
                </div>
              )}
            </div>

            <div className="detail-actions-bottom">
              <a 
                href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                className="reply-btn"
                onClick={() => handleStatusChange(selectedContact._id, 'replied')}
              >
                Reply via Email
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminContact;