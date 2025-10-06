import React from "react";
import { FaUser, FaEnvelope, FaIdCard, FaSignOutAlt } from "react-icons/fa";

function Profile({ user, onLogout }) {
  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>User Profile</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <FaUser style={{ color: '#64748b' }} />
          <div>
            <strong>Username:</strong>
            <p style={{ margin: 0 }}>{user?.username}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <FaEnvelope style={{ color: '#64748b' }} />
          <div>
            <strong>Email:</strong>
            <p style={{ margin: 0 }}>{user?.email || 'Not provided'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <FaIdCard style={{ color: '#64748b' }} />
          <div>
            <strong>Role:</strong>
            <p style={{ margin: 0 }}>{user?.role || 'User'}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            width: '100%',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;