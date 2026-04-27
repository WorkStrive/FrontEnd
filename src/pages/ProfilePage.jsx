import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Mail, Lock, Shield } from 'lucide-react';
import client from '../api/client';
import { motion } from 'framer-motion';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({ name: '', email: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await client.get('/auth/me');
            setProfile({ name: data.data?.name || data.name || '', email: data.data?.email || data.email || '' });
        } catch (err) {
            console.error('Failed to fetch profile', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setSavingProfile(true);
        try {
            await client.patch('/auth/profile', profile);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setSavingProfile(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setMessage({ type: 'error', text: 'New passwords do not match.' });
        }
        setSavingPassword(true);
        try {
            await client.post('/auth/reset-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: 'Password reset successful!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error?.message || err.response?.data?.message || 'Failed to securely reset password.' });
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading profile...</div>;

    return (
        <div className="fade-in">
            <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', background: 'none', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                <ChevronLeft size={18} />
                Back
            </button>

            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>User Profile</h1>
                <p style={{ color: 'var(--text-muted)' }}>Gestion et modification du profil utilisateur.</p>
            </header>

            {message.text && (
                <div style={{ padding: '1rem', marginBottom: '2rem', borderRadius: '8px', background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.type === 'success' ? '#10b981' : '#ef4444', border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                    {message.text}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                        <User size={24} color="var(--primary)" />
                        <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Personal Information</h2>
                    </div>
                    <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Full Name"
                                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" disabled={savingProfile} style={{ padding: '0.8rem', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: '600', opacity: savingProfile ? 0.7 : 1, marginTop: '0.5rem' }}>
                            {savingProfile ? 'Saving...' : 'Update Profile'}
                        </button>
                    </form>
                </motion.section>

                <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                        <Shield size={24} color="var(--primary)" />
                        <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Réinitialisation Sécurisée</h2>
                    </div>
                    <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                placeholder="Current Password"
                                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                placeholder="New Password"
                                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                minLength="6"
                                required
                            />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                minLength="6"
                                required
                            />
                        </div>
                        <button type="submit" disabled={savingPassword} style={{ padding: '0.8rem', background: 'var(--secondary)', color: 'white', borderRadius: '8px', fontWeight: '600', opacity: savingPassword ? 0.7 : 1, marginTop: '0.5rem' }}>
                            {savingPassword ? 'Processing...' : 'Reset Securely'}
                        </button>
                    </form>
                </motion.section>
            </div>
        </div>
    );
};

export default ProfilePage;
