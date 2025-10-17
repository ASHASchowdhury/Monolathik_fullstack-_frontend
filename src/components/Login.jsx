import React, { useState } from "react";
import axios from "axios";
import { FaUser, FaLock, FaBuilding, FaExclamationTriangle, FaCheck } from "react-icons/fa";

function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_BASE = "http://localhost:8080";

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!credentials.username || !credentials.password) {
      setError("Please enter both username and password");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Login attempt with:", { username: credentials.username });

      const response = await axios.post(`${API_BASE}/auth/login`, {
        username: credentials.username,
        password: credentials.password
      });

      console.log("Login API response:", response.data);

      if (response.data.success) {
        const userData = {
          username: response.data.username,
          role: response.data.role,
          name: response.data.username,
          email: `${response.data.username}@company.com`
        };

        localStorage.setItem("user", JSON.stringify(userData));
        
        setSuccess(`Login successful! Welcome ${userData.role} ${userData.name}`);
        
        setTimeout(() => onLogin(userData), 1000);
      } else {
        setError(response.data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login API error:", err);
      
      if (err.response?.status === 401) {
        setError("Invalid username or password");
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

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    if (error) setError("");
    if (success) setSuccess("");
  };

  const demoAccounts = [
    { username: "hr", password: "hr123", role: "HR" },
    { username: "director", password: "director123", role: "DIRECTOR" },
    { username: "pm", password: "pm123", role: "PROJECT_MANAGER" },
    { username: "cto", password: "cto123", role: "CTO" },
    { username: "employee", password: "employee123", role: "USER" }
  ];

  const fillDemoCredentials = (account) => {
    setCredentials({
      username: account.username,
      password: account.password
    });
    setError("");
    setSuccess(`Demo ${account.role} account loaded - Click Login`);
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "2.5rem",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e2e8f0",
        width: "100%",
        maxWidth: "420px",
        position: "relative"
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #10b981, #059669)"
        }}></div>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
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
          }}>
            <FaBuilding />
          </div>
          <h1 style={{
            color: "#1e293b",
            fontSize: "1.75rem",
            fontWeight: "700",
            margin: "0 0 0.5rem 0"
          }}>Office Management</h1>
          <p style={{ color: "#64748b", fontSize: "1rem", margin: 0 }}>
            Sign in to your account
          </p>
        </div>

        {error && (
          <div style={{
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
          }}>
            <FaExclamationTriangle />
            {error}
          </div>
        )}
        {success && (
          <div style={{
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
          }}>
            <FaCheck />
            {success}
          </div>
        )}

        <form onSubmit={handleLogin} style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}>
          <div style={{ position: "relative" }}>
            <FaUser style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              fontSize: "0.9rem"
            }} />
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Username"
              style={{
                width: "100%",
                padding: "0.75rem 1rem 0.75rem 2.5rem",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                boxSizing: "border-box",
                transition: "all 0.2s ease"
              }}
              required
              disabled={isLoading}
            />
          </div>

          <div style={{ position: "relative" }}>
            <FaLock style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              fontSize: "0.9rem"
            }} />
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Password"
              style={{
                width: "100%",
                padding: "0.75rem 1rem 0.75rem 2.5rem",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                boxSizing: "border-box",
                transition: "all 0.2s ease"
              }}
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "white",
              border: "none",
              padding: "0.875rem 1.5rem",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              marginTop: "0.5rem",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
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
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div style={{
          marginTop: "1.5rem",
          padding: "1rem",
          backgroundColor: "#f1f5f9",
          borderRadius: "8px"
        }}>
          <div style={{
            fontSize: "0.9rem",
            fontWeight: "600",
            color: "#475569",
            marginBottom: "0.5rem"
          }}>Demo Accounts:</div>
          {demoAccounts.map((account, index) => (
            <div key={index} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.5rem",
              fontSize: "0.8rem",
              color: "#64748b"
            }}>
              <span>{account.role}: {account.username}</span>
              <button
                type="button"
                style={{
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  cursor: "pointer"
                }}
                onClick={() => fillDemoCredentials(account)}
              >
                Use
              </button>
            </div>
          ))}
        </div>
      </div>

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