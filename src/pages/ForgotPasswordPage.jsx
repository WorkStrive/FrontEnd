import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ChevronLeft, ShieldCheck } from 'lucide-react';
import client from '../api/client';
import { motion } from 'framer-motion';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', text: '' });
        setLoading(true);
        try {
            // Mock API endpoint for forgot password, it expects an email
            await client.post('/auth/forgot-password', { email });
            setStatus({ type: 'success', text: 'If an account exists with this email, a reset secure link has been sent to it.' });
        } catch (err) {
            setStatus({ type: 'error', text: err.response?.data?.error?.message || err.response?.data?.message || 'Unable to request password reset.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass"
                style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', marginBottom: '1rem', color: '#10b981' }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Réinitialisation Sécurisée</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>We will send you a secure link to reset your password.</p>
                </div>

                {status.text && (
                    <div style={{ padding: '0.8rem', marginBottom: '1.5rem', borderRadius: '8px', background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: status.type === 'success' ? '#10b981' : '#ef4444', border: `1px solid ${status.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`, fontSize: '0.85rem', textAlign: 'center' }}>
                        {status.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="email"
                            placeholder="Account Email Address"
                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '0.8rem',
                            background: 'var(--primary)',
                            color: 'white',
                            borderRadius: '8px',
                            fontWeight: '600',
                            marginTop: '0.5rem',
                            opacity: loading ? 0.7 : 1,
                            transition: 'var(--transition)'
                        }}
                    >
                        {loading ? 'Sending Request...' : 'Send Reset Link'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <ChevronLeft size={16} /> Back to Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
