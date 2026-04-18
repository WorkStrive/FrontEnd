import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, Calendar, Users, ChevronRight } from 'lucide-react';
import client from '../api/client';
import { motion } from 'framer-motion';

const ProjectCard = ({ project, onClick }) => (
    <motion.div
        whileHover={{ y: -5 }}
        onClick={() => onClick(project.id)}
        className="glass"
        style={{ padding: '1.5rem', cursor: 'pointer', transition: 'var(--transition)' }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ padding: '0.8rem', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '12px' }}>
                <Briefcase size={20} color="var(--primary)" />
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{project.name}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {project.description || 'No description provided.'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={14} />
                {new Date(project.createdAt * 1000).toLocaleDateString()}
            </div>
        </div>
    </motion.div>
);

const DashboardPage = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data } = await client.get('/projects');
            setProjects(data.data);
        } catch (err) {
            console.error('Failed to fetch projects', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await client.post('/projects', newProject);
            setShowCreateModal(false);
            setNewProject({ name: '', description: '' });
            fetchProjects();
        } catch (err) {
            console.error('Failed to create project', err);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading workspace...</div>;

    return (
        <div className="fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Your Projects</h1>
                    <p style={{ color: 'var(--text-primary)' }}>Manage your team and track progress</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                        padding: '0.7rem 1.2rem',
                        background: 'var(--primary)',
                        color: 'white',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '600'
                    }}
                >
                    <Plus size={20} />
                    New Project
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {projects.map(project => (
                    <ProjectCard key={project.id} project={project} onClick={(id) => navigate(`/project/${id}`)} />
                ))}
            </div>

            {showCreateModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Create New Project</h2>
                        <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Project Name"
                                style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}
                                value={newProject.name}
                                onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', minHeight: '100px' }}
                                value={newProject.description}
                                onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                            />
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '0.8rem', background: 'none', border: '1px solid var(--border)', color: 'white', borderRadius: '8px' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '0.8rem', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: '600' }}>Create Project</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
