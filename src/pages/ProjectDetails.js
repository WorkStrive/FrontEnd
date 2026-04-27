import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Check, Plus, Trash2, Edit2, ListTodo, FolderGit2, X, Wand2, Users, UserPlus, LogOut, UserMinus, AlertTriangle } from 'lucide-react';
import './ProjectDetails.css';
import './Dashboard.css'; // Reuse modal styles

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiTriggeredCounts, setAiTriggeredCounts] = useState(new Set());
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch project details. Depending on your backend, these might be one or two calls.
      const projRes = await api.get(`/api/v1/projects/${id}`);

      // Some backends return the project with populated tasks immediately.
      // If it doesn't, we fetch tasks separately (assuming nested route)
      const data = projRes.data.data || projRes.data;
      setProject(data);

      try {
        // Because of backend routing (mounted at /api/v1/tasks), the URL is weird!
        const tasksRes = await api.get(`/api/v1/tasks/projects/${id}/tasks`);
        const tasksData = tasksRes.data.data || tasksRes.data;
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } catch (e) {
        // Fallback to query param if nested doesn't work
        const tasksRes2 = await api.get(`/api/v1/tasks?projectId=${id}`);
        const tasksData2 = tasksRes2.data.data || tasksRes2.data;
        setTasks(Array.isArray(tasksData2) ? tasksData2 : (data.tasks || []));
      }

      // Suppression de l'appel automatique à /suggestions pour ne pas spammer l'IA à chaque rechargement
      // L'IA sera déclenchée uniquement en fonction du nombre de tâches.

      try {
        const memRes = await api.get(`/api/v1/projects/${id}/members`);
        const memData = memRes.data.data || memRes.data;
        setMembers(Array.isArray(memData) ? memData : []);
      } catch (e) {
        console.error("Failed to load project members", e);
      }
    } catch (err) {
      console.error("Failed to load project details", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const generateAISuggestions = useCallback(async () => {
    if (isGeneratingAI) return;
    try {
      setIsGeneratingAI(true);
      const suggRes = await api.get(`/api/v1/projects/${id}/suggestions`);
      const suggData = suggRes.data.data || suggRes.data;
      if (!suggData || suggData.length === 0) {
        alert("L'IA n'a pas pu générer de suggestions. Vérifiez votre backend ou votre clé API.");
      }
      setSuggestions(prev => {
        const newSuggs = Array.isArray(suggData) ? suggData : [];
        // prevent duplicate IDs
        const existingIds = new Set(prev.map(s => s.id || s._id));
        return [...prev, ...newSuggs.filter(s => !existingIds.has(s.id || s._id))];
      });
    } catch (e) {
      console.error("AI Generation failed", e.response?.data || e.message);
      alert("Erreur lors de la génération IA: " + (e.response?.data?.error?.message || "Le backend a retourné une erreur."));
    } finally {
      setIsGeneratingAI(false);
    }
  }, [id, isGeneratingAI]);

  // "chaque trois taches l IA donne des suggestion" -> Watch for every 3 tasks
  useEffect(() => {
    if (tasks.length > 0 && tasks.length % 3 === 0) {
      if (!aiTriggeredCounts.has(tasks.length)) {
        // Trigger AI
        setAiTriggeredCounts(prev => new Set(prev).add(tasks.length));
        generateAISuggestions();
      }
    }
  }, [tasks.length, aiTriggeredCounts, generateAISuggestions]);

  const openNewTaskModal = () => {
    setEditingTask(null);
    setTaskTitle('');
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setTaskTitle(task.title || task.name || '');
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      if (editingTask) {
        // Update task uses PATCH according to backend
        await api.patch(`/api/v1/tasks/tasks/${editingTask.id || editingTask._id}`, {
          title: taskTitle.trim()
        });
      } else {
        // Create task
        await api.post(`/api/v1/tasks/projects/${id}/tasks`, {
          title: taskTitle.trim()
        });
      }
      setIsTaskModalOpen(false);
      fetchData(); // reload
    } catch (err) {
      console.error("Failed to save task", err);
      const errorMsg = err.response?.data?.error?.message ||
        err.response?.data?.message ||
        (err.response?.data ? JSON.stringify(err.response.data) : err.message);
      alert('Could not save task: ' + errorMsg);
    }
  };

  const toggleTaskStatus = async (task) => {
    const isCompleted = task.status === 'DONE' || task.status?.toLowerCase() === 'completed';
    const newStatusBackend = isCompleted ? 'TODO' : 'DONE';
    const taskId = task.id || task._id;
    try {
      // Optimistic update
      setTasks(tasks.map(t => (t.id || t._id) === taskId ? { ...t, status: newStatusBackend } : t));
      await api.patch(`/api/v1/tasks/tasks/${taskId}`, { status: newStatusBackend });
      fetchData(); // Reload safely to ensure consistency
    } catch (err) {
      console.error("Failed to update status", err.response?.data || err);
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
      fetchData(); // Rollback if failed
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/api/v1/tasks/tasks/${taskId}`);
      setTasks(tasks.filter(t => (t.id || t._id) !== taskId));
    } catch (err) {
      console.error("Failed to delete task", err);
      alert('Could not delete task. Check API endpoint configuration.');
    }
  };

  const handleAcceptSuggestion = async (sId) => {
    try {
      await api.post(`/api/v1/projects/${id}/suggestions/${sId}/accept`);
      setSuggestions(suggestions.filter(s => (s.id || s._id) !== sId));
      fetchData(); // refresh to show the new task
    } catch (err) {
      alert('Failed to accept suggestion');
    }
  };

  const handleRejectSuggestion = async (sId) => {
    try {
      await api.post(`/api/v1/projects/${id}/suggestions/${sId}/reject`);
      setSuggestions(suggestions.filter(s => (s.id || s._id) !== sId));
    } catch (err) {
      alert('Failed to reject suggestion');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;
    try {
      await api.post(`/api/v1/projects/${id}/members`, { email: newMemberEmail });
      setNewMemberEmail('');
      fetchData(); // refresh members
    } catch (err) {
      console.error("Add member error", err);
      const errObj = err.response?.data?.error;
      const msg = errObj?.message || (err.response?.data ? JSON.stringify(err.response.data) : err.message);
      alert('Failed to add member: ' + msg);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.delete(`/api/v1/projects/${id}/members/${userId}`);
      setMembers(members.filter(m => {
        const uId = m.user?._id || m.user?.id || m.id || m._id || m.userId;
        return uId !== userId;
      }));
    } catch (err) {
      console.error("Remove member error", err);
      const errObj = err.response?.data?.error;
      const msg = errObj?.message || (err.response?.data ? JSON.stringify(err.response.data) : err.message);
      alert('Failed to remove member: ' + msg);
    }
  };

  const handleQuitProject = async () => {
    if (!window.confirm('Are you certain you want to quit this project?')) return;
    try {
      await api.delete(`/api/v1/projects/${id}/members/me`);
      navigate('/dashboard');
    } catch (err) {
      console.error("Quit project error", err);
      const errObj = err.response?.data?.error;
      const msg = errObj?.message || (err.response?.data ? JSON.stringify(err.response.data) : err.message);

      // If the backend says owner cannot quit, automatically trigger our delete flow
      if (msg.toLowerCase().includes('delete the project instead') || msg.toLowerCase().includes('owner cannot quit') || err.response?.status === 400) {
        if (window.confirm('As the owner, you cannot just leave. Use the "Delete Project" button below. Would you like to forcefully delete the project now?')) {
          handleDeleteProject();
        }
      } else {
        alert('Failed to quit project: ' + msg);
      }
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('DANGER: This will permanently delete the project and all its tasks. Are you absolutely sure?')) return;
    try {
      const res = await api.delete(`/api/v1/projects/${id}`);
      if (res.data && res.data.success === false) {
        throw new Error(res.data.message || 'The server responded with success=false');
      }

      // VÉRIFICATION D'ERREUR DU BACKEND : Est-ce qu'il a vraiment été supprimé ?
      try {
        const verifyRes = await api.get(`/api/v1/projects/${id}`);
        // S'il ne lance aucune erreur (404 Not Found), c'est qu'il existe toujours dans le backend !
        if (verifyRes.data) {
          alert("ERREUR CRITIQUE DU BACKEND : L'application web a envoyé l'ordre de suppression avec succès, mais le serveur l'a ignoré et a gardé le projet !! Vous devez corriger votre backend (API), il ne supprime pas les données !");
          // On le redirige quand même
          navigate('/dashboard');
          return;
        }
      } catch (e) {
        // C'est normal, il doit renvoyer une erreur 404 si le projet est bien supprimé
      }

      navigate('/dashboard');
    } catch (deleteErr) {
      const errObj = deleteErr.response?.data?.error;
      const msg = errObj?.message || (deleteErr.response?.data ? JSON.stringify(deleteErr.response.data) : deleteErr.message);
      alert('Failed to delete project: ' + msg);
    }
  };

  if (loading) {
    return <div className="dashboard-container"><div className="empty-state">Loading workspace...</div></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="project-details-header">
        <Link to="/dashboard" className="back-link">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="project-title-section">
          <h1 className="dashboard-title">
            <FolderGit2 color="var(--primary-color)" />
            {project?.name || 'Project Overview'}
          </h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} onClick={generateAISuggestions} disabled={isGeneratingAI}>
              <Wand2 size={18} style={{ marginRight: '8px' }} className={isGeneratingAI ? "spin" : ""} />
              {isGeneratingAI ? "Thinking..." : "AI Suggest"}
            </button>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} onClick={() => setIsMembersModalOpen(true)}>
              <Users size={18} style={{ marginRight: '8px' }} />
              Members
            </button>
            <button className="btn" onClick={openNewTaskModal}>
              <Plus size={18} style={{ marginRight: '8px' }} />
              Add Task
            </button>
          </div>
        </div>
      </div>

      {isGeneratingAI && (
        <div className="suggestions-panel" style={{ textAlign: 'center', opacity: 0.7 }}>
          <Wand2 className="magic-icon" size={24} style={{ animation: 'spin 2s linear infinite' }} />
          <h3 style={{ marginTop: '10px' }}>L'IA analyse vos tâches et prépare de nouvelles suggestions...</h3>
        </div>
      )}

      {suggestions && suggestions.length > 0 && !isGeneratingAI && (
        <div className="suggestions-panel">
          <div className="suggestions-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Wand2 className="magic-icon" size={20} />
              <h3>AI Task Suggestions</h3>
              <span className="premium-badge">New</span>
            </div>
          </div>
          <div className="suggestions-grid">
            {suggestions.map(s => {
              const sId = s.id || s._id;
              return (
                <div key={sId} className="suggestion-card">
                  <div className="suggestion-content">
                    <p className="suggestion-title">{s.title || s.name || s.description || 'New task suggestion'}</p>
                  </div>
                  <div className="suggestion-actions">
                    <button className="btn-sm success-btn" onClick={() => handleAcceptSuggestion(sId)}>
                      <Check size={14} /> Accept
                    </button>
                    <button className="btn-sm danger-btn-link" onClick={() => handleRejectSuggestion(sId)}>
                      Reject
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="kanban-board">
        {/* Pending Column */}
        <div className="kanban-column">
          <div className="kanban-column-header">
            <h3>To Do</h3>
            <span className="kanban-badge">{tasks.filter(t => t.status !== 'DONE' && t.status !== 'completed').length}</span>
          </div>
          <div className="kanban-cards">
            {tasks.filter(t => t.status !== 'DONE' && t.status !== 'completed').map(task => {
              const taskId = task.id || task._id;
              return (
                <div key={taskId} className="kanban-card">
                  <div className="kanban-card-top">
                    <span className="status-badge status-pending">Pending</span>
                    <div className="task-actions">
                      <button className="icon-btn" onClick={() => openEditTaskModal(task)} title="Edit Task">
                        <Edit2 size={14} />
                      </button>
                      <button className="icon-btn delete" onClick={() => deleteTask(taskId)} title="Delete Task">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h4 className="task-title">{task.title || task.name}</h4>
                  <div className="kanban-card-bottom">
                    <button className="btn-sm" onClick={() => toggleTaskStatus(task)}>
                      Mark Complete <Check size={14} style={{ marginLeft: 4 }} />
                    </button>
                  </div>
                </div>
              );
            })}
            {tasks.filter(t => t.status !== 'DONE' && t.status !== 'completed').length === 0 && (
              <div className="empty-column">No pending tasks</div>
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="kanban-column">
          <div className="kanban-column-header">
            <h3>Done</h3>
            <span className="kanban-badge completed-badge">{tasks.filter(t => t.status === 'DONE' || t.status === 'completed').length}</span>
          </div>
          <div className="kanban-cards">
            {tasks.filter(t => t.status === 'DONE' || t.status === 'completed').map(task => {
              const taskId = task.id || task._id;
              return (
                <div key={taskId} className="kanban-card completed-card">
                  <div className="kanban-card-top">
                    <span className="status-badge status-completed">Completed</span>
                    <div className="task-actions">
                      <button className="icon-btn delete" onClick={() => deleteTask(taskId)} title="Delete Task">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h4 className="task-title" style={{ textDecoration: 'line-through' }}>{task.title || task.name}</h4>
                  <div className="kanban-card-bottom">
                    <button className="btn-sm secondary" onClick={() => toggleTaskStatus(task)}>
                      Reopen Task
                    </button>
                  </div>
                </div>
              );
            })}
            {tasks.filter(t => t.status === 'DONE' || t.status === 'completed').length === 0 && (
              <div className="empty-column">No completed tasks yet</div>
            )}
          </div>
        </div>
      </div>

      {isTaskModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTaskModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTask ? 'Edit Task' : 'New Task'}</h3>
              <button className="modal-close" onClick={() => setIsTaskModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTask}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="E.g., Design homepage layout"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setIsTaskModalOpen(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={!taskTitle.trim()}>
                  {editingTask ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isMembersModalOpen && (
        <div className="modal-overlay" onClick={() => setIsMembersModalOpen(false)}>
          <div className="modal-content members-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={24} color="var(--primary-color)" />
                <h3>Project Members</h3>
              </div>
              <button className="modal-close" onClick={() => setIsMembersModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="members-list">
              {members.map(member => {
                const userInfo = member.user || member;
                const memId = userInfo.userId || userInfo.id || userInfo._id || member._id;
                // Prioritize email if available, then name, then fallback
                const userEmail = userInfo.email || member.email;
                const userName = userInfo.name || userInfo.username || userEmail || userInfo.firstName || `User #${memId}`;
                const userRole = member.role || 'MEMBER';
                const initial = typeof userName === 'string' && !userName.startsWith('User #') ? userName.charAt(0).toUpperCase() : 'U';

                const isOwner = userRole.toUpperCase() === 'OWNER';

                return (
                  <div key={memId || Math.random()} className="member-item">
                    <div className="member-info">
                      <div className="member-avatar">{initial}</div>
                      <div style={{ overflow: 'hidden' }}>
                        <p className="member-name" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: '0.95rem' }} title={userName}>{userName}</p>
                        {userEmail && userName !== userEmail && <p className="member-role" style={{ fontSize: '0.75rem', opacity: 0.8 }}>{userEmail}</p>}
                        <p className="member-role">{isOwner ? 'Owner' : 'Member'}</p>
                      </div>
                    </div>
                    {!isOwner && (
                      <button className="icon-btn delete" onClick={() => handleRemoveMember(memId)} title="Remove Member">
                        <UserMinus size={16} />
                      </button>
                    )}
                  </div>
                )
              })}
              {members.length === 0 && <p className="empty-state" style={{ padding: '1rem' }}>No members found.</p>}
            </div>

            <form onSubmit={handleAddMember} className="add-member-form">
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Invite user by email..."
                  value={newMemberEmail}
                  onChange={e => setNewMemberEmail(e.target.value)}
                  required
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn" style={{ padding: '0 16px' }} disabled={!newMemberEmail.trim()}>
                  <UserPlus size={18} />
                </button>
              </div>
            </form>

            {/* Check if current user is owner visually */}
            {members.some(m => {
              const uId = (m.user?.id || m.user?._id || m.userId || m._id)?.toString();
              const ctxUid = (user?.id || user?._id || user?.userId)?.toString();
              return (uId === ctxUid || (m.email && user?.email && m.email === user.email)) && m.role?.toUpperCase() === 'OWNER';
            }) ? (
              <div className="quit-section" style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button className="btn full-width" onClick={handleDeleteProject} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-color)', border: '1px solid rgba(239, 68, 68, 0.3)', justifyContent: 'center' }}>
                  <AlertTriangle size={16} style={{ marginRight: '8px' }} /> Delete Project
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '8px' }}>You are the owner. You cannot just leave.</p>
              </div>
            ) : (
              <div className="quit-section" style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button className="btn danger-btn-link" onClick={handleQuitProject} style={{ width: '100%', justifyContent: 'center' }}>
                  <LogOut size={16} style={{ marginRight: '8px' }} /> Leave Project
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
