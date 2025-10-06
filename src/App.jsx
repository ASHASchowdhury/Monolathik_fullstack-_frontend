import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './components/Login';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true); // true=login, false=register

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

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