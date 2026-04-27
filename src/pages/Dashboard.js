import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Folder, Plus, X, FolderGit2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [error, setError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/projects?t=${Date.now()}`);
      const data = res.data.data || res.data;
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch projects", err);
      // Fallback
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      setError('');
      await api.post('/api/v1/projects', { name: newProjectName.trim() });
      setNewProjectName('');
      setIsModalOpen(false);
      fetchProjects(); // Reload projects
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        (err.response?.data ? JSON.stringify(err.response.data) : err.message)
      );
    }
  };

  return (
    <div className="dashboard-container">
      {/* Hero Metrics Area */}
      <div className="hero-metrics">
        <div className="metric-card">
          <div className="metric-title">Total Projects</div>
          <div className="metric-value">{projects.length || 0}</div>
          <div className="metric-trend positive">+2 from last week</div>
        </div>
        <div className="metric-card">
          <div className="metric-title">Tasks Completed</div>
          <div className="metric-value">12</div>
          <div className="metric-trend positive">+4 from yesterday</div>
        </div>
        <div className="metric-card">
          <div className="metric-title">Upcoming Deadlines</div>
          <div className="metric-value" style={{ color: 'var(--error-color)' }}>3</div>
          <div className="metric-trend negative">Needs attention</div>
        </div>
      </div>

      <div className="section-title">
        <h2>Your Projects</h2>
      </div>

      {loading ? (
        <div className="empty-state">Loading projects...</div>
      ) : (
        <div className="projects-grid">
          {projects.map((p) => (
            <Link to={`/project/${p.id || p._id}`} key={p.id || p._id} className="project-card">
              <div className="project-name">{p.name}</div>
              <div className="project-meta">
                <Folder size={14} /> Open Project Workspace
              </div>
            </Link>
          ))}

          <div className="project-card add-project-card" onClick={() => setIsModalOpen(true)}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={24} />
            </div>
            <span style={{ fontWeight: 500 }}>Create New Project</span>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create a Project</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <div className="input-with-icon">
                  <FolderGit2 size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="E.g., Website Redesign"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={!newProjectName.trim()}>
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
