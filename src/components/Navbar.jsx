import React from 'react';
import { LogOut, Home, Briefcase, PlusCircle, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!token) return null;

    return (
        <nav className="glass" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            margin: '1rem',
            position: 'sticky',
            top: '1rem',
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Briefcase size={24} color="var(--primary)" />
                    <span>WorkStrive</span>
                </Link>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Home size={18} />
                        Dashboard
                    </Link>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <Link to="/profile" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)' }}>
                        <User size={16} />
                    </div>
                    Profile
                </Link>
                <button
                    onClick={handleLogout}
                    style={{
                        background: 'none',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        transition: 'var(--transition)'
                    }}
                    onMouseOver={(e) => e.target.style.color = 'var(--danger)'}
                    onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
