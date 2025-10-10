import React, { useState } from "react";
import axios from "axios";
import { FaUser, FaLock, FaBuilding, FaEnvelope, FaExclamationTriangle, FaCheck } from "react-icons/fa";

function Login({ onLogin, isLogin }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    email: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // API Base URL
  const API_BASE = "http://localhost:8080";

  // Allowed roles that can access the system
  const ALLOWED_ROLES = ["HR", "PM", "CTO", "DIRECTOR"];

  /**
   * Handle login form submission
   * Makes API call to /auth/login endpoint
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Basic validation
    if (!credentials.username || !credentials.password) {
      setError("Please enter both username and password");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Login attempt with:", {
        username: credentials.username,
        password: "***" // Don't log actual password
      });

      // API Call: POST /auth/login
      const response = await axios.post(`${API_BASE}/auth/login`, {
        username: credentials.username,
        password: credentials.password
      });

      console.log("Login API response:", response.data);

      // Handle successful login response
      if (response.data.success) {
        const userData = {
          id: response.data.id || Date.now(), // Use timestamp as fallback ID
          username: response.data.username,
          role: response.data.role,
          name: response.data.name || response.data.username, // Use name if provided, else username
          email: response.data.email || `${response.data.username}@company.com`
        };

        // Check if user has allowed role
        if (!ALLOWED_ROLES.includes(userData.role.toUpperCase())) {
          setError("Access denied. Only HR, PM, CTO, and Director can access this system.");
          setIsLoading(false);
          return;
        }

        // Store user data in localStorage for session persistence
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", response.data.token || "dummy-token"); // Store token if available
        
        setSuccess(`Login successful! Welcome ${userData.role} ${userData.name}`);
        
        // Notify parent component about successful login
        setTimeout(() => onLogin(userData), 1500);
      } else {
        setError(response.data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login API error:", err);
      
      // Enhanced error handling
      if (err.response?.status === 401) {
        setError("Invalid username or password");
      } else if (err.response?.status === 403) {
        setError("Access denied. Insufficient permissions.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.request) {
        setError("Cannot connect to server. Please check if the backend is running.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };



  /**
   * Handle form submission based on current mode (login/register)
   */
  const handleSubmit = (e) => {
    if (isLogin) {
      handleLogin(e);
    } 
  };

  /**
   * Handle input changes and clear errors
   */
  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  // Inline styles for the component
  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    loginCard: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "2.5rem",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e2e8f0",
      width: "100%",
      maxWidth: "420px",
      position: "relative"
    },
    header: {
      textAlign: "center",
      marginBottom: "2rem"
    },
    logo: {
      width: "64px",
      height: "64px",
      background: "linear-gradient(135deg, #10b981, #059669)",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "1.5rem",
      margin: "0 auto 1rem"
    },
    title: {
      color: "#1e293b",
      fontSize: "1.75rem",
      fontWeight: "700",
      margin: "0 0 0.5rem 0"
    },
    subtitle: {
      color: "#64748b",
      fontSize: "1rem",
      margin: 0
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem"
    },
    inputGroup: {
      position: "relative"
    },
    input: {
      width: "100%",
      padding: "0.75rem 1rem 0.75rem 2.5rem",
      border: "2px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "0.95rem",
      fontFamily: "inherit",
      boxSizing: "border-box",
      transition: "all 0.2s ease"
    },
    inputIcon: {
      position: "absolute",
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#94a3b8",
      fontSize: "0.9rem"
    },
    submitBtn: {
      background: "linear-gradient(135deg, #10b981, #059669)",
      color: "white",
      border: "none",
      padding: "0.875rem 1.5rem",
      borderRadius: "8px",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      marginTop: "0.5rem",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem"
    },
    toggleText: {
      textAlign: "center",
      color: "#64748b",
      fontSize: "0.9rem",
      marginTop: "1.5rem"
    },
    toggleLink: {
      color: "#10b981",
      fontWeight: "600",
      cursor: "pointer",
      background: "none",
      border: "none",
      textDecoration: "underline"
    },
    error: {
      backgroundColor: "#fee2e2",
      color: "#dc2626",
      padding: "0.75rem 1rem",
      borderRadius: "8px",
      fontSize: "0.9rem",
      textAlign: "center",
      marginBottom: "1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem"
    },
    success: {
      backgroundColor: "#d1fae5",
      color: "#065f46",
      padding: "0.75rem 1rem",
      borderRadius: "8px",
      fontSize: "0.9rem",
      textAlign: "center",
      marginBottom: "1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem"
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        {/* Top accent bar */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #10b981, #059669)"
        }}></div>

        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <FaBuilding />
          </div>
          <h1 style={styles.title}>Company Portal</h1>
          <p style={styles.subtitle}>
            {isLogin ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={styles.error}>
            <FaExclamationTriangle />
            {error}
          </div>
        )}
        {success && (
          <div style={styles.success}>
            <FaCheck />
            {success}
          </div>
        )}

        {/* Login/Register Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Username Field */}
          <div style={styles.inputGroup}>
            <FaUser style={styles.inputIcon} />
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Username"
              style={styles.input}
              required
              disabled={isLoading}
            />
          </div>

          {/* Email Field (Only for Registration) */}
          {!isLogin && (
            <div style={styles.inputGroup}>
              <FaEnvelope style={styles.inputIcon} />
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                placeholder="Email address"
                style={styles.input}
                required
                disabled={isLoading}
              />
            </div>
          )}

          {/* Password Field */}
          <div style={styles.inputGroup}>
            <FaLock style={styles.inputIcon} />
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Password"
              style={styles.input}
              required
              disabled={isLoading}
              minLength={isLogin ? 1 : 6}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer"
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid transparent",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></div>
                {isLogin ? "Signing In..." : "Creating Account..."}
              </>
            ) : (
              isLogin ? "Sign In" : "Create Account"
            )}
          </button>
        </form>

      
      </div>

      {/* Loading animation styles */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default Login;