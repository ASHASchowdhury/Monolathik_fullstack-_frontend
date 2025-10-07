import React, { useState } from "react";
import axios from "axios";
import { FaUser, FaLock, FaBuilding, FaEnvelope, FaExclamationTriangle, FaCheck } from "react-icons/fa";

function Login({ onLogin, isLogin, onToggleMode }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    email: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // API Base URL
  const API_BASE = "http://10.0.6.1:8080";

  /**
   * Handle login form submission
   * Makes API call to /auth/login endpoint
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Login attempt with:", {
        username: credentials.username,
        password: credentials.password
      });

      const response = await axios.post(`${API_BASE}/auth/login`, {
        username: credentials.username,
        password: credentials.password
      });

      console.log("Login API response:", response.data);

      if (response.data.success) {
        const userData = {
          id: response.data.id,
          username: response.data.username,
          role: response.data.role,
          name: response.data.username,
          email: credentials.email || `${response.data.username}@company.com`
        };
        
        localStorage.setItem("user", JSON.stringify(userData));
        setSuccess("Login successful! Redirecting...");
        
        setTimeout(() => onLogin(userData), 1000);
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login API error:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Login failed. Please check your credentials and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle registration form submission
   * Makes API call to /auth/register endpoint
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    console.log("=== REGISTRATION DEBUG ===");
    console.log("Registration data:", credentials);

    // Enhanced validation
    if (!credentials.email.includes('@')) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (credentials.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (credentials.username.length < 3) {
      setError("Username must be at least 3 characters long");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Making API call to:", `${API_BASE}/auth/register`);
      
      const response = await axios.post(`${API_BASE}/auth/register`, {
        username: credentials.username,
        password: credentials.password,
        email: credentials.email
      });

      console.log("Registration response:", response.data);

      // Handle successful registration response
      if (response.data.success || response.data.message || response.status === 200) {
        setSuccess("Registration successful! Please login with your credentials.");
        // Switch to login mode after successful registration
        setTimeout(() => {
          onToggleMode();
          setCredentials({ username: "", password: "", email: "" });
        }, 2000);
      } else {
        setError(response.data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.data?.message) {
        setError(`Registration failed: ${err.response.data.message}`);
      } else if (err.response?.status === 409) {
        setError("Username already exists. Please choose a different username.");
      } else if (err.response?.status === 400) {
        setError("Invalid registration data. Please check your input.");
      } else if (err.request) {
        setError("Cannot connect to server. Please check if the backend is running.");
      } else {
        setError("Registration failed. Please try again.");
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
    } else {
      handleRegister(e);
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
    },
    testButton: {
      background: "none",
      border: "1px solid #d1d5db",
      color: "#6b7280",
      padding: "0.5rem 1rem",
      borderRadius: "6px",
      fontSize: "0.8rem",
      cursor: "pointer",
      marginTop: "1rem",
      width: "100%"
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
                {isLogin ? "Signing In..." : "Registering..."}
              </>
            ) : (
              isLogin ? "Sign In" : "Register Now"
            )}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div style={styles.toggleText}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            style={styles.toggleLink}
            onClick={onToggleMode}
            disabled={isLoading}
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>
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