const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(localStorage.getItem('token') && {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }),
      ...options.headers
    };

    const config = {
      method: options.method || 'GET',
      headers,
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Contact methods
  async submitContact(contactData) {
    return this.request('/contact', {
      method: 'POST',
      body: contactData
    });
  }

  async getContacts(page = 1, limit = 10) {
    return this.request(`/contact?page=${page}&limit=${limit}`);
  }

  async updateContactStatus(id, status) {
    return this.request(`/contact/${id}`, {
      method: 'PATCH',
      body: { status }
    });
  }

  // Project methods
  async getProjects() {
    return this.request('/projects');
  }

  async getAdminProjects() {
    return this.request('/projects/admin/all');
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: projectData
    });
  }

  async updateProject(id, projectData) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: projectData
    });
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE'
    });
  }

  // Skills methods
  async getSkills() {
    return this.request('/skills');
  }

  async getAdminSkills() {
    return this.request('/skills/admin/all');
  }

  async createSkill(skillData) {
    return this.request('/skills', {
      method: 'POST',
      body: skillData
    });
  }

  async updateSkill(id, skillData) {
    return this.request(`/skills/${id}`, {
      method: 'PUT',
      body: skillData
    });
  }

  async deleteSkill(id) {
    return this.request(`/skills/${id}`, {
      method: 'DELETE'
    });
  }
}

export default new ApiService();