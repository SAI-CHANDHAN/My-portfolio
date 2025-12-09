import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';
import SEO from './components/common/SEO';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Skills from './pages/Skills';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Admin Pages
import Admin from './pages/admin/Admin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProjects from './pages/admin/Projects';
import AdminBlog from './pages/admin/Blog';
import ProjectForm from './pages/admin/ProjectForm';
import BlogForm from './pages/admin/BlogForm';
import AdminSkills from './pages/admin/Skills';
import AdminContact from './pages/admin/Contact';

// Routing Components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Styles
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="App min-h-screen flex flex-col">
              <SEO />
              <ScrollToTop />
              
              {/* Navigation */}
              <Navbar />
              
              {/* Main Content */}
              <main className="flex-grow pt-16">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/skills" element={<Skills />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  
                  {/* Protected Admin Routes */}
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute>
                        <Admin />
                      </ProtectedRoute>
                    }
                  >
                    {/* Nested Admin Routes */}
                    <Route index element={<AdminDashboard />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="projects" element={<AdminProjects />} />
                    <Route path="projects/new" element={<ProjectForm />} />
                    <Route path="projects/:id" element={<ProjectForm />} />
                    <Route path="blog" element={<AdminBlog />} />
                    <Route path="blog/new" element={<BlogForm />} />
                    <Route path="blog/:id" element={<BlogForm />} />
                    <Route path="skills" element={<AdminSkills />} />
                    <Route path="contacts" element={<AdminContact />} />
                    <Route path="contact" element={<AdminContact />} />
                  </Route>
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              
              {/* Footer */}
              <Footer />
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;