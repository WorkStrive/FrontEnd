import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, CheckCircle, Circle, Trash2, Wand2, User, Users, Clock, Mail, Shield, UserMinus, Edit2, Settings } from 'lucide-react';
import client from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'members'

    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [taskForm, setTaskForm] = useState({ title: '', description: '' });
    const [editingTask, setEditingTask] = useState(null);
    const [projectForm, setProjectForm] = useState({ name: '', description: '' });
    const [newMember, setNewMember] = useState({ email: '', role: 'MEMBER' });

    const [suggesting, setSuggesting] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        try {
            const projRes = await client.get(`/projects/${id}`);
            setProject(projRes.data?.data || projRes.data);

            let profileData = null;
            try {
                const profileRes = await client.get(`/auth/me`);
                profileData = profileRes.data?.data || profileRes.data;
            } catch (e) {}
            setCurrentUser(profileData);

            let tasksData = [];
            try {
                const tasksRes = await client.get(`/tasks/projects/${id}/tasks`).catch(() => client.get(`/tasks?projectId=${id}`));
                tasksData = tasksRes.data?.data || tasksRes.data;
            } catch (e) {}
            setTasks(Array.isArray(tasksData) ? tasksData : []);

            let membersData = [];
            try {
                const membersRes = await client.get(`/projects/${id}/members`);
                membersData = membersRes.data?.data || membersRes.data;
            } catch (e) {}
            setMembers(Array.isArray(membersData) ? membersData : []);

        } catch (err) {
            console.error('Failed to fetch project details', err);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        try {
            const projRes = await client.get(`/projects/${id}`);
            setProject(projRes.data?.data || projRes.data);

            try {
                const tasksRes = await client.get(`/tasks/projects/${id}/tasks`).catch(() => client.get(`/tasks?projectId=${id}`));
                const tasksData = tasksRes.data?.data || tasksRes.data;
                setTasks(Array.isArray(tasksData) ? tasksData : []);
            } catch (e) {}

            try {
                const membersRes = await client.get(`/projects/${id}/members`);
                const membersData = membersRes.data?.data || membersRes.data;
                setMembers(Array.isArray(membersData) ? membersData : []);
            } catch (e) {}
        } catch (err) {
            console.error('Failed to refresh data', err);
        }
    };

    const handleSaveTask = async (e) => {
        e.preventDefault();
        try {
            if (editingTask) {
                await client.patch(`/tasks/tasks/${editingTask.id || editingTask._id}`, taskForm);
            } else {
                await client.post(`/tasks/projects/${id}/tasks`, taskForm);
            }
            setShowTaskModal(false);
            setEditingTask(null);
            setTaskForm({ title: '', description: '' });
            refreshData();
        } catch (err) {
            console.error('Failed to save task', err);
            alert('Could not save task. ' + (err.response?.data?.message || err.message));
        }
    };

    const openEditTaskModal = (task) => {
        setEditingTask(task);
        setTaskForm({ title: task.title || task.name || '', description: task.description || '' });
        setShowTaskModal(true);
    };

    const handleUpdateProject = async (e) => {
        e.preventDefault();
        try {
            await client.patch(`/projects/${id}`, projectForm);
            setShowProjectModal(false);
            refreshData();
        } catch (err) {
            console.error('Failed to update project', err);
            alert('Could not update project.');
        }
    };

    const handleDeleteProject = async () => {
        if (!window.confirm("Are you sure you want to permanently delete this project and all its tasks?")) return;
        try {
            await client.delete(`/projects/${id}`);
            navigate('/');
        } catch (err) {
            console.error('Failed to delete project', err);
            alert('Could not delete project.');
        }
    };

    const handleToggleTask = async (task) => {
        try {
            const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
            await client.patch(`/tasks/tasks/${task.id || task._id}`, { status: newStatus });
            refreshData();
        } catch (err) {
            console.error('Failed to update task', err);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await client.delete(`/tasks/tasks/${taskId}`);
            refreshData();
        } catch (err) {
            console.error('Failed to delete task', err);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            await client.post(`/projects/${id}/members`, newMember);
            setShowMemberModal(false);
            setNewMember({ email: '', role: 'MEMBER' });
            refreshData();
        } catch (err) {
            alert(err.response?.data?.error?.message || 'Failed to add member');
        }
    };

    const handleKickMember = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;
        try {
            await client.delete(`/projects/${id}/members/${userId}`);
            refreshData();
        } catch (err) {
            console.error('Failed to kick member', err);
        }
    };

    const handleSuggestTasks = async () => {
        setSuggesting(true);
        setSuggestions([]);
        try {
            const { data } = await client.post(`/projects/${id}/suggest-tasks`);
            setSuggestions(data);
        } catch (err) {
            console.error('Failed to get suggestions', err);
        } finally {
            setSuggesting(false);
        }
    };

    const handleRejectSuggestion = async (suggestionId) => {
        try {
            await client.post(`/projects/${id}/suggestions/${suggestionId}/reject`);
            setSuggestions(suggestions.filter(s => s.id !== suggestionId));
        } catch (err) {
            console.error('Failed to reject suggestion', err);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading project...</div>;

    const isOwner = project.ownerId === currentUser?.id;

    return (
        <div className="fade-in">
            <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', background: 'none', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                <ChevronLeft size={18} />
                Back to Dashboard
            </button>

            <header style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0 }}>{project.name}</h1>
                            {isOwner && (
                                <>
                                    <button onClick={() => { setProjectForm({ name: project.name, description: project.description || '' }); setShowProjectModal(true); }} style={{ background: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }} title="Edit Project">
                                        <Settings size={20} />
                                    </button>
                                    <button onClick={handleDeleteProject} style={{ background: 'none', color: 'rgba(239, 68, 68, 0.6)', cursor: 'pointer', padding: '4px' }} title="Delete Project">
                                        <Trash2 size={20} />
                                    </button>
                                </>
                            )}
                        </div>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: 0 }}>{project.description}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {activeTab === 'tasks' ? (
                            <>
                                <button
                                    onClick={handleSuggestTasks}
                                    disabled={suggesting}
                                    style={{
                                        padding: '0.7rem 1.2rem',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        border: '1px solid var(--secondary)',
                                        color: 'var(--secondary)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: '600',
                                        opacity: suggesting ? 0.6 : 1
                                    }}
                                >
                                    <Wand2 size={20} />
                                    {suggesting ? 'Thinking...' : 'AI Suggest'}
                                </button>
                                <button
                                    onClick={() => { setEditingTask(null); setTaskForm({ title: '', description: '' }); setShowTaskModal(true); }}
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
                                    Add Task
                                </button>
                            </>
                        ) : (
                            isOwner && (
                                <button
                                    onClick={() => setShowMemberModal(true)}
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
                                    <Users size={20} />
                                    Invite Member
                                </button>
                            )
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        style={{ background: 'none', color: activeTab === 'tasks' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '600', position: 'relative', padding: '0.5rem 0' }}
                    >
                        Tasks
                        {activeTab === 'tasks' && <motion.div layoutId="tab" style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: 'var(--primary)' }} />}
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        style={{ background: 'none', color: activeTab === 'members' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '600', position: 'relative', padding: '0.5rem 0' }}
                    >
                        Members
                        {activeTab === 'members' && <motion.div layoutId="tab" style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: 'var(--primary)' }} />}
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeTab === 'tasks' ? (
                    <motion.div key="tasks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                        <section>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <AnimatePresence>
                                    {tasks.map(task => (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="glass"
                                            style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                                        >
                                            <button onClick={() => handleToggleTask(task)} style={{ background: 'none', color: task.status === 'DONE' ? 'var(--secondary)' : 'var(--text-muted)' }}>
                                                {task.status === 'DONE' ? <CheckCircle size={24} /> : <Circle size={24} />}
                                            </button>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: '1rem', textDecoration: task.status === 'DONE' ? 'line-through' : 'none', color: task.status === 'DONE' ? 'var(--text-muted)' : 'var(--text-main)' }}>{task.title || task.name}</h4>
                                                {task.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{task.description}</p>}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => openEditTaskModal(task)} style={{ background: 'none', color: 'var(--text-muted)', transition: 'var(--transition)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-main)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteTask(task.id || task._id)} style={{ background: 'none', color: 'rgba(239, 68, 68, 0.4)', transition: 'var(--transition)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--danger)'} onMouseOut={e => e.currentTarget.style.color = 'rgba(239, 68, 68, 0.4)'}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {tasks.length === 0 && <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', border: '2px dashed var(--border)', borderRadius: '12px' }}>No tasks yet. Get started by adding one!</p>}
                            </div>
                        </section>

                        <aside>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem' }}>AI Suggestions</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {suggestions.map((s, idx) => (
                                    <motion.div
                                        key={s.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="glass"
                                        style={{ padding: '1rem', borderLeft: '3px solid var(--secondary)' }}
                                    >
                                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>{s.title}</h4>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>{s.description}</p>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleAcceptSuggestion(s.id)}
                                                style={{ flex: 2, padding: '0.4rem', background: 'var(--secondary)', color: 'white', fontSize: '0.8rem', borderRadius: '6px', fontWeight: '600' }}
                                            >
                                                Add to Project
                                            </button>
                                            <button
                                                onClick={() => handleRejectSuggestion(s.id)}
                                                style={{ flex: 1, padding: '0.4rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', fontSize: '0.8rem', borderRadius: '6px', fontWeight: '600' }}
                                            >
                                                Refuse
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                                {suggestions.length === 0 && !suggesting && (
                                    <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <Wand2 size={24} color="var(--text-muted)" style={{ marginBottom: '0.8rem' }} />
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Use AI to discover missing pieces of your project.</p>
                                    </div>
                                )}
                                {suggesting && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Generating smart ideas...</p>}
                            </div>
                        </aside>
                    </motion.div>
                ) : (
                    <motion.div key="members" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {members.map(member => (
                            <div key={member.userId} className="glass" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: 45, height: 45, borderRadius: '50%', background: 'var(--border)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)' }}>
                                    <User size={24} />
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {member.user?.email || member.email || `Utilisateur #${member.userId}`}
                                    </h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        <Shield size={12} />
                                        {member.role}
                                    </div>
                                </div>
                                {isOwner && member.userId !== currentUser?.id && (
                                    <button onClick={() => handleKickMember(member.userId)} style={{ background: 'none', color: 'var(--danger)', opacity: 0.6 }} title="Remove Member">
                                        <UserMinus size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {showTaskModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>{editingTask ? 'Update Task' : 'Add New Task'}</h2>
                            <form onSubmit={handleSaveTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Task Title"
                                    className="glass"
                                    style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                    value={taskForm.title}
                                    onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                                    required
                                />
                                <textarea
                                    placeholder="Task Description"
                                    className="glass"
                                    style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white', minHeight: '100px' }}
                                    value={taskForm.description}
                                    onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                                />
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" onClick={() => setShowTaskModal(false)} style={{ flex: 1, padding: '0.8rem', background: 'none', border: '1px solid var(--border)', color: 'white', borderRadius: '8px' }}>Cancel</button>
                                    <button type="submit" style={{ flex: 1, padding: '0.8rem', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: '600' }}>{editingTask ? 'Save Changes' : 'Add Task'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showProjectModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Update Project Configuration</h2>
                            <form onSubmit={handleUpdateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Project Name"
                                    className="glass"
                                    style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                    value={projectForm.name}
                                    onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                                    required
                                />
                                <textarea
                                    placeholder="Project Description"
                                    className="glass"
                                    style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white', minHeight: '100px' }}
                                    value={projectForm.description}
                                    onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                                />
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" onClick={() => setShowProjectModal(false)} style={{ flex: 1, padding: '0.8rem', background: 'none', border: '1px solid var(--border)', color: 'white', borderRadius: '8px' }}>Cancel</button>
                                    <button type="submit" style={{ flex: 1, padding: '0.8rem', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: '600' }}>Update Project</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showMemberModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Invite Member</h2>
                            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="email"
                                        placeholder="User Email"
                                        className="glass"
                                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                        value={newMember.email}
                                        onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <select
                                    className="glass"
                                    style={{ padding: '0.8rem', background: 'rgba(30, 41, 59, 1)', color: 'white' }}
                                    value={newMember.role}
                                    onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                                >
                                    <option value="MEMBER">Member</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" onClick={() => setShowMemberModal(false)} style={{ flex: 1, padding: '0.8rem', background: 'none', border: '1px solid var(--border)', color: 'white', borderRadius: '8px' }}>Cancel</button>
                                    <button type="submit" style={{ flex: 1, padding: '0.8rem', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: '600' }}>Send Invite</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProjectDetailsPage;
