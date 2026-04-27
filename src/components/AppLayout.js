import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderGit2, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Hexagon 
} from 'lucide-react';
import api from '../api/axios';
import './AppLayout.css';

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Optionally fetch projects for the sidebar navigation
    const fetchSidebarProjects = async () => {
      try {
        const res = await api.get(`/api/v1/projects?t=${Date.now()}`);
        const data = res.data.data || res.data;
        setProjects(Array.isArray(data) ? data.slice(0, 5) : []); // Only show top 5 in sidebar
      } catch (err) {
        // Silent fail for sidebar
      }
    };
    fetchSidebarProjects();
  }, [location.pathname]); // Refresh when navigating

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <Hexagon size={28} color="var(--primary-color)" />
          <span>NexusApp</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          
          <div className="sidebar-projects-header">Recent Projects</div>
          {projects.map(p => (
            <NavLink key={p.id || p._id} to={`/project/${p.id || p._id}`} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ paddingLeft: '24px', fontSize: '0.9rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-color)' }}></div>
              {p.name}
            </NavLink>
          ))}
          
          <div style={{ flex: 1 }}></div>

          <div className="nav-item" style={{ cursor: 'pointer' }} onClick={() => alert('Settings UI placeholder')}>
            <Settings size={20} />
            Settings
          </div>
          <div className="nav-item" style={{ cursor: 'pointer', color: 'var(--error-color)' }} onClick={handleLogout}>
            <LogOut size={20} />
            Logout
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="app-main">
        {/* Topbar */}
        <header className="app-topbar">
          <div className="search-container">
            <Search size={18} color="var(--text-secondary)" />
            <input type="text" placeholder="Search tasks, projects..." />
          </div>

          <div className="topbar-actions">
            <button className="action-btn">
              <Bell size={20} />
              <div className="notification-dot"></div>
            </button>
            
            <div className="user-profile-menu">
              <div className="user-avatar">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name || 'User'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content area */}
        <div className="app-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
