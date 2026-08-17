import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, ShieldCheck, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: '640px', margin: '2rem auto' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="avatar-circle" style={{ width: '72px', height: '72px', fontSize: '2rem' }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{user.name}</h1>
            <span className="badge badge-in_progress" style={{ marginTop: '0.25rem' }}>
              DevOps Team Member
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
            <User size={20} color="#818cf8" />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full Name</div>
              <div style={{ fontWeight: 600 }}>{user.name}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
            <Mail size={20} color="#818cf8" />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Address</div>
              <div style={{ fontWeight: 600 }}>{user.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
            <Calendar size={20} color="#818cf8" />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Member Since</div>
              <div style={{ fontWeight: 600 }}>
                {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
            <ShieldCheck size={20} color="#34d399" />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Authentication Standard</div>
              <div style={{ fontWeight: 600 }}>JWT Bearer Token + Bcrypt Salt</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleLogout} className="btn btn-danger">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
