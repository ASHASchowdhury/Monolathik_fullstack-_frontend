import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './components/Login';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true); // true=login, false=register
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app startup
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser)); // Restore user session from localStorage
    }
    setLoading(false);
  }, []);

  /**
   * Handle successful login
   * @param {Object} userData - User data from API response
   */
  const handleLogin = (userData) => {
    setUser(userData); // Set user state to trigger Dashboard render
  };

  /**
   * Handle user logout
   * Clears all stored authentication data
   */
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null); // Reset user state to trigger Login render
  };

  // Show loading spinner while checking authentication
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

  // Show Login component if no user is authenticated
  if (!user) {
    return (
      <Login 
        onLogin={handleLogin} 
        isLogin={showLogin}
        onToggleMode={() => setShowLogin(!showLogin)}
      />
    );
  }

  // Show Dashboard if user is authenticated
  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;