import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { 
  FaPaperPlane, 
  FaRobot, 
  FaUser, 
  FaSync, 
  FaExclamationTriangle,
  FaTimes,
  FaExpand,
  FaCompress
} from "react-icons/fa";
import "./AIChat.css";

function AIChat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const API_BASE = "http://localhost:8080";

  // FIXED: Proper authentication headers
  const getAuthConfig = () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.warn('No user data found in localStorage');
        return { headers: {} };
      }
      
      const user = JSON.parse(userData);
      return {
        headers: {
          'X-Username': user.username || '',
          'X-Role': user.role || 'USER'
        }
      };
    } catch (error) {
      console.error('Error getting auth config:', error);
      return { headers: {} };
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: "Hello! I'm your AI assistant. How can I help you with HR management, employee tasks, or department queries today?",
          sender: "ai",
          timestamp: new Date(),
          role: "AI Assistant"
        }
      ]);
    }
  }, [isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError("");

    try {
      const config = getAuthConfig();
      
      const response = await axios.post(
        `${API_BASE}/ai/chat`,
        { message: inputMessage },
        config
      );

      console.log("AI Response:", response.data);

      if (response.data.response) {
        const aiMessage = {
          id: Date.now() + 1,
          text: response.data.response,
          sender: "ai",
          timestamp: new Date(),
          role: response.data.role || "AI Assistant",
          source: response.data.source
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error("No response from AI service");
      }

    } catch (err) {
      console.error("Error sending message:", err);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting to the AI service. Please try again later.",
        sender: "ai",
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setError(err.response?.data?.error || "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your AI assistant. How can I help you with HR management, employee tasks, or department queries today?",
        sender: "ai",
        timestamp: new Date(),
        role: "AI Assistant"
      }
    ]);
    setError("");
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Quick questions suggestions
  const quickQuestions = [
    "How do I add a new employee?",
    "Show me department statistics",
    "How to assign tasks to team members?",
    "What's the process for employee onboarding?"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  if (!isOpen) {
    return (
      <div className="ai-chat-closed">
        <button 
          className="chat-toggle-btn"
          onClick={() => setIsOpen(true)}
          title="Open AI Chat"
        >
          <FaRobot className="chat-icon" />
          <span className="chat-badge">AI</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`ai-chat-container ${isExpanded ? 'expanded' : ''}`}>
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-title">
          <FaRobot className="title-icon" />
          <div>
            <h3>AI Assistant</h3>
            <span className="chat-subtitle">HR & Office Management</span>
          </div>
        </div>
        <div className="chat-actions">
          <button 
            className="icon-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? <FaCompress /> : <FaExpand />}
          </button>
          <button 
            className="icon-btn"
            onClick={clearChat}
            title="Clear Chat"
          >
            <FaSync />
          </button>
          <button 
            className="icon-btn close-btn"
            onClick={() => setIsOpen(false)}
            title="Close Chat"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender} ${message.isError ? 'error' : ''}`}
          >
            <div className="message-avatar">
              {message.sender === "ai" ? <FaRobot /> : <FaUser />}
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="sender-name">
                  {message.sender === "ai" ? (message.role || "AI Assistant") : "You"}
                </span>
                <span className="message-time">
                  {formatTime(new Date(message.timestamp))}
                </span>
              </div>
              <div className="message-text">
                {message.text}
                {message.source === "fallback" && (
                  <span className="fallback-badge">Fallback Response</span>
                )}
              </div>
              {message.isError && (
                <div className="error-indicator">
                  <FaExclamationTriangle />
                  Connection Issue
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai loading">
            <div className="message-avatar">
              <FaRobot />
            </div>
            <div className="message-content">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 2 && (
        <div className="quick-questions">
          <div className="quick-questions-title">Quick Questions:</div>
          <div className="quick-questions-grid">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                className="quick-question-btn"
                onClick={() => handleQuickQuestion(question)}
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="chat-error-banner">
          <FaExclamationTriangle />
          {error}
        </div>
      )}

      {/* Chat Input */}
      <form className="chat-input-form" onSubmit={sendMessage}>
        <div className="input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="send-btn"
          >
            {isLoading ? (
              <FaSync className="spin" />
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AIChat;