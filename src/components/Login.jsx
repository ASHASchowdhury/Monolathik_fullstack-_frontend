import React, { useState } from "react";
import { FaUser, FaLock, FaBuilding, FaEnvelope } from "react-icons/fa";

function Login({ onLogin, isLogin, onToggleMode }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    email: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Demo login - replace with your API
      const demoUser = {
        id: 1,
        username: credentials.username || "admin",
        role: "admin",
        name: credentials.username || "Admin User",
        email: credentials.email || "admin@company.com"
      };
      
      localStorage.setItem("user", JSON.stringify(demoUser));
      localStorage.setItem("token", "demo-token");
      onLogin(demoUser);
      
    } catch (err) {
      console.log("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
      maxWidth: "420px"
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
      boxSizing: "border-box"
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
      marginTop: "0.5rem"
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
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <FaBuilding />
          </div>
          <h1 style={styles.title}>Company Portal</h1>
          <p style={styles.subtitle}>
            {isLogin ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <FaUser style={styles.inputIcon} />
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              placeholder="Username"
              style={styles.input}
              required
            />
          </div>

          {!isLogin && (
            <div style={styles.inputGroup}>
              <FaEnvelope style={styles.inputIcon} />
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                placeholder="Email address"
                style={styles.input}
                required
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <FaLock style={styles.inputIcon} />
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              placeholder="Password"
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              opacity: isLoading ? 0.7 : 1
            }}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div style={styles.toggleText}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            style={styles.toggleLink}
            onClick={onToggleMode}
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;