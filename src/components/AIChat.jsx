import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { 
  FaPaperPlane, FaRobot, FaUser, FaSync, FaExclamationTriangle,
  FaTimes, FaExpand, FaCompress, FaFilePdf, FaUpload, FaCheckCircle,
  FaBrain, FaGlobe
} from "react-icons/fa";
import "./AIChat.css";

function AIChat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [usePdfMode, setUsePdfMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // API Configuration - SEPARATE APIS
  const PDF_AI_API_BASE = "http://10.0.6.22:3737"; // Your API for PDF AI
  const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"; // DeepSeek for General AI
   const DEEPSEEK_API_KEY = "sk-81d2983aa27a467e9a9adcdde90fde52";

  // Initialize user info
  useEffect(() => {
    initializeUserInfo();
  }, []);

  const initializeUserInfo = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserInfo(user);
      }
    } catch (error) {
      console.error('Error initializing user info:', error);
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
      const welcomeMessage = {
        id: 1,
        text: getWelcomeMessage(),
        sender: "ai",
        timestamp: new Date(),
        role: "AI Assistant"
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, usePdfMode]);

  const getWelcomeMessage = () => {
    if (usePdfMode) {
      return "Welcome to PDF Assistant! Upload a PDF file and ask questions about its content using our PDF AI.";
    }
    return userInfo 
      ? `Hello ${userInfo.username || 'there'}! I'm your DeepSeek AI assistant. How can I help you today?`
      : "Hello! I'm your DeepSeek AI assistant. How can I help you today?";
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError("Please select a PDF file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      setError("");
    }
  };

  // Upload PDF to your PDF AI API
  const uploadPdf = async () => {
    if (!selectedFile) {
      setError("Please select a PDF file first");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError("");

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await axios.post(
        `${PDF_AI_API_BASE}/upload-pdf`,
        formData,
        {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log("PDF Upload Response:", response.data);

      if (response.status === 200) {
        setPdfUploaded(true);
        const successMessage = {
          id: Date.now(),
          text: `PDF "${selectedFile.name}" uploaded successfully! Now you can ask questions about its content using PDF AI.`,
          sender: "ai",
          timestamp: new Date(),
          role: "PDF AI Assistant"
        };
        setMessages(prev => [...prev, successMessage]);
      } else {
        throw new Error(response.data?.error || "Upload failed");
      }

    } catch (err) {
      console.error("Error uploading PDF:", err);
      
      let errorMessage = "Failed to upload PDF. ";
      if (err.code === 'ERR_NETWORK') {
        errorMessage += "Cannot connect to PDF AI server. Please check if the server is running.";
      } else if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
      } else {
        errorMessage += err.message || "Unknown error occurred";
      }
      
      setError(errorMessage);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

 const callGeneralAI = async (message) => {
  try {
    // Option 1: Hugging Face Free API (No key required for some models)
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large",
      {
        inputs: message,
        parameters: {
          max_length: 1000,
          temperature: 0.7
        }
      },
      {
        headers: {
          'Authorization': 'Bearer your_huggingface_token_optional', // Optional for some models
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return response.data[0]?.generated_text || "I received your message but couldn't generate a response.";
    
  } catch (err) {
    console.error("AI API error:", err);
    
    // Fallback to mock responses if API fails
    const mockResponses = {
      "What is JSX syntax?": "JSX is a syntax extension for JavaScript that allows you to write HTML-like code in React components. It makes components more readable and easier to write.",
      "How to use props in React?": "Props (properties) are used to pass data from parent to child components in React. They are read-only and make components reusable.",
      "Explain React component lifecycle": "React components have lifecycle methods: componentDidMount (after render), componentDidUpdate (after update), componentWillUnmount (before removal). With hooks, we use useEffect.",
      "What are React hooks?": "React hooks are functions that let you use state and lifecycle features in functional components. Common hooks: useState, useEffect, useContext."
    };
    
    return mockResponses[message] || `I understand you're asking about: "${message}". This is a demo response. In production, this would connect to a real AI API.`;
  }
};
  // Call PDF AI API for PDF mode
  const callPdfAI = async (message) => {
    const params = new URLSearchParams();
    params.append('question', message);

    const response = await axios.post(
      `${PDF_AI_API_BASE}/ask`,
      params,
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 30000
      }
    );

    let aiResponseText = "";

    // Handle response format from PDF AI
    if (response.data) {
      if (typeof response.data === 'string') {
        aiResponseText = response.data;
      } else if (response.data.answer) {
        aiResponseText = response.data.answer;
      } else if (response.data.response) {
        aiResponseText = response.data.response;
      } else if (response.data.message) {
        aiResponseText = response.data.message;
      } else {
        aiResponseText = JSON.stringify(response.data);
      }
    }

    if (!aiResponseText || aiResponseText.toLowerCase().includes("error")) {
      throw new Error(aiResponseText || "No response from PDF AI");
    }

    return aiResponseText;
  };

  // Send message to appropriate API
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    if (usePdfMode && !pdfUploaded) {
      setError("Please upload a PDF file first before sending messages");
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
      username: userInfo?.username || 'User'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError("");

    try {
      let aiResponseText;
      let aiRole;
      let aiSource;

      if (usePdfMode) {
        // Use PDF AI API
        aiResponseText = await callPdfAI(inputMessage);
        aiRole = "PDF AI Assistant";
        aiSource = "pdf-ai";
      } else {
        // Use DeepSeek API
     aiResponseText = await callGeneralAI(inputMessage);

        aiRole = "DeepSeek AI";
        aiSource = "deepseek";
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: "ai",
        timestamp: new Date(),
        role: aiRole,
        source: aiSource
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      console.error("Error sending message:", err);
      
      let errorText = "Sorry, I'm having trouble processing your request. ";
      
      if (err.response) {
        errorText += `Server error: ${err.response.status} - ${err.response.data?.error || 'Unknown error'}`;
      } else if (err.request) {
        errorText += "No response from server. Please check your connection.";
      } else {
        errorText += err.message || "Please try again later.";
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        sender: "ai",
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setError(errorText);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const welcomeMessage = {
      id: 1,
      text: getWelcomeMessage(),
      sender: "ai",
      timestamp: new Date(),
      role: "AI Assistant"
    };
    setMessages([welcomeMessage]);
    setError("");
  };

  const handleModeToggle = (newMode) => {
    if (usePdfMode !== newMode) {
      setUsePdfMode(newMode);
      setPdfUploaded(false);
      setSelectedFile(null);
      setError("");
      
      const welcomeMessage = {
        id: 1,
        text: getWelcomeMessage(),
        sender: "ai",
        timestamp: new Date(),
        role: newMode ? "PDF AI Assistant" : "DeepSeek AI"
      };
      setMessages([welcomeMessage]);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const quickQuestions = [
    "What is JSX syntax?",
    "How to use props in React?",
    "Explain React component lifecycle",
    "What are React hooks?"
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
          {usePdfMode ? <FaFilePdf className="title-icon" /> : <FaBrain className="title-icon" />}
          <div>
            <h3>AI Assistant</h3>
            <span className="chat-subtitle">
              {usePdfMode ? "PDF AI" : "DeepSeek AI"} | {userInfo?.username || 'Guest'}
            </span>
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

      {/* Mode Toggle */}
      <div className="mode-toggle-section">
        <div className="mode-toggle">
          <button 
            className={`mode-btn ${!usePdfMode ? 'active' : ''}`}
            onClick={() => handleModeToggle(false)}
          >
            <FaBrain />
            <span>DeepSeek AI</span>
          </button>
          <button 
            className={`mode-btn ${usePdfMode ? 'active' : ''}`}
            onClick={() => handleModeToggle(true)}
          >
            <FaFilePdf />
            <span>PDF AI</span>
          </button>
        </div>
      </div>

      {/* PDF Upload Section - Only for PDF AI mode */}
      {usePdfMode && (
        <div className="pdf-upload-section">
          <div className="upload-area">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf"
              style={{ display: 'none' }}
            />
            
            {!pdfUploaded ? (
              <>
                <button 
                  className="upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <FaUpload />
                  {selectedFile ? "Change PDF" : "Select PDF"}
                </button>
                
                {selectedFile && (
                  <div className="file-info">
                    <FaFilePdf />
                    <span className="file-name">{selectedFile.name}</span>
                    <button 
                      className="upload-submit-btn"
                      onClick={uploadPdf}
                      disabled={isUploading}
                    >
                      {isUploading ? `Uploading... ${uploadProgress}%` : "Upload to PDF AI"}
                    </button>
                  </div>
                )}
                
                {isUploading && (
                  <div className="upload-progress">
                    <div 
                      className="progress-bar"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </>
            ) : (
              <div className="upload-success">
                <FaCheckCircle className="success-icon" />
                <span>PDF Ready: {selectedFile.name}</span>
                <button 
                  className="change-file-btn"
                  onClick={() => {
                    setPdfUploaded(false);
                    setSelectedFile(null);
                  }}
                >
                  Change File
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender} ${message.isError ? 'error' : ''}`}
          >
            <div className="message-avatar">
              {message.sender === "ai" ? (
                usePdfMode ? <FaFilePdf /> : <FaBrain />
              ) : (
                <FaUser />
              )}
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="sender-name">
                  {message.sender === "ai" ? message.role : (message.username || "You")}
                  {message.source && (
                    <span className={`source-badge ${message.source}`}>
                      {message.source}
                    </span>
                  )}
                </span>
                <span className="message-time">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              <div className="message-text">
                {message.text}
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
              {usePdfMode ? <FaFilePdf /> : <FaBrain />}
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

      {/* Quick Questions - Only show in DeepSeek AI mode */}
      {!usePdfMode && messages.length <= 2 && (
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
          <button onClick={() => setError("")} className="error-close">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Chat Input */}
      <form className="chat-input-form" onSubmit={sendMessage}>
        <div className="input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              usePdfMode 
                ? (pdfUploaded ? "Ask about your PDF content..." : "Upload a PDF first to ask questions...")
                : "Ask DeepSeek AI anything..."
            }
            disabled={isLoading || (usePdfMode && !pdfUploaded)}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading || (usePdfMode && !pdfUploaded)}
            className="send-btn"
            title={usePdfMode && !pdfUploaded ? "Upload PDF first" : "Send message"}
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