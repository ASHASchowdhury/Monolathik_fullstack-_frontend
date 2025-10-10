import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './components/Login';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      // Check if user has valid role when loading from localStorage
      const allowedRoles = ["HR", "PM", "CTO", "DIRECTOR"];
      if (allowedRoles.includes(userData.role?.toUpperCase())) {
        setUser(userData);
      } else {
        // Clear invalid user data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Login 
        onLogin={handleLogin} 
        isLogin={showLogin}
        onToggleMode={() => setShowLogin(!showLogin)}
      />
    );
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;