import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { 
  FaPaperPlane, FaRobot, FaUser, FaSync, FaExclamationTriangle,
  FaTimes, FaExpand, FaCompress, FaFilePdf, FaUpload, FaCheckCircle,
  FaBrain, FaGlobe
} from "react-icons/fa";
import "./AIChat.css";

function AIChat() {
  // State management for chat functionality
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
  
  // Refs for DOM elements
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // API Configuration
  const PDF_AI_API_BASE = "http://10.0.6.22:3333"; // Your PDF AI server
  const GOOGLE_AI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";
  const GOOGLE_AI_API_KEY = "AIzaSyAjfD4Im7OXMtk2vkI9Hb1rY4es2TnNiYE";

  // Initialize user info from localStorage on component mount
  useEffect(() => {
    initializeUserInfo();
  }, []);

  // Get user information from localStorage
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

  // Scroll to bottom of chat messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message when chat opens for the first time
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

  // Generate appropriate welcome message based on mode
  const getWelcomeMessage = () => {
    if (usePdfMode) {
      return "Welcome to PDF Assistant! Upload a PDF file and ask questions about its content using our PDF AI.";
    }
    return userInfo 
      ? `Hello ${userInfo.username || 'there'}! I'm your Google Gemini 2.0 Flash AI assistant. How can I help you today?`
      : "Hello! I'm your Google Gemini 2.0 Flash AI assistant. How can I help you today?";
  };

  // Handle PDF file selection with validation
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setError("Please select a PDF file");
        return;
      }
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      setError("");
    }
  };

  // Upload PDF to PDF AI API
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

      // Simulate upload progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload PDF to the PDF AI server
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

  // Reset PDF session on the server
  const resetPdfSession = async () => {
    try {
      const response = await axios.post(`${PDF_AI_API_BASE}/reset`);
      console.log("PDF session reset:", response.data);
      return true;
    } catch (err) {
      console.error("Error resetting PDF session:", err);
      return false;
    }
  };

  // Clear chat and reset PDF session if in PDF mode
  const clearChat = async () => {
    // Reset PDF session if in PDF mode and PDF was uploaded
    if (usePdfMode && pdfUploaded) {
      await resetPdfSession();
    }
    
    const welcomeMessage = {
      id: 1,
      text: getWelcomeMessage(),
      sender: "ai",
      timestamp: new Date(),
      role: "AI Assistant"
    };
    setMessages([welcomeMessage]);
    setError("");
    
    // Reset PDF states if in PDF mode
    if (usePdfMode) {
      setPdfUploaded(false);
      setSelectedFile(null);
    }
  };

  // Call Google Gemini AI for general questions
  const callGeneralAI = async (message) => {
    try {
      const response = await axios.post(
        `${GOOGLE_AI_API_URL}?key=${GOOGLE_AI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: message
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            topP: 0.8,
            topK: 40
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      // Extract response from Google Gemini API
      if (response.data && response.data.candidates && response.data.candidates.length > 0) {
        return response.data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Invalid response format from Google AI");
      }
      
    } catch (err) {
      console.error("Google AI API error:", err);
      
      // If Gemini 2.0 Flash fails, try Gemini 1.5 Flash as fallback
      try {
        const fallbackResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: message
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );

        if (fallbackResponse.data && fallbackResponse.data.candidates && fallbackResponse.data.candidates.length > 0) {
          return fallbackResponse.data.candidates[0].content.parts[0].text;
        }
      } catch (fallbackErr) {
        console.log("Gemini 1.5 fallback also failed:", fallbackErr);
      }
      
      // Final fallback - smart local responses
      return generateSmartResponse(message);
    }
  };

  // Smart local response generator as final fallback
  const generateSmartResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Programming questions
    if (lowerMessage.includes("react") || lowerMessage.includes("jsx")) {
      if (lowerMessage.includes("jsx") || lowerMessage.includes("syntax")) {
        return "JSX is a syntax extension for JavaScript that allows you to write HTML-like code in React components. It makes components more readable and easier to write. Example: `const element = <h1>Hello, world!</h1>;`";
      }
      if (lowerMessage.includes("props") || lowerMessage.includes("properties")) {
        return "Props (properties) are used to pass data from parent to child components in React. They are read-only and make components reusable. Example: `function Welcome(props) { return <h1>Hello, {props.name}</h1>; }`";
      }
      if (lowerMessage.includes("hook") || lowerMessage.includes("useState") || lowerMessage.includes("useEffect")) {
        return "React hooks are functions that let you use state and lifecycle features in functional components. Common hooks:\n- useState: Manage component state\n- useEffect: Handle side effects\n- useContext: Access context values\nExample: `const [count, setCount] = useState(0);`";
      }
      if (lowerMessage.includes("component") && lowerMessage.includes("lifecycle")) {
        return "React components have lifecycle methods:\n- componentDidMount: After component renders\n- componentDidUpdate: After component updates\n- componentWillUnmount: Before component removal\nWith hooks, we use useEffect to handle lifecycle events.";
      }
    }

    // Default responses
    const defaultResponses = [
      `I understand you're asking about: "${message}". I'm using a fallback response as the AI service is temporarily unavailable.`,
      `Regarding "${message}", I can provide general information but for detailed answers, the AI service needs to be configured properly.`,
      `I've received your question about "${message}". For comprehensive AI responses, please check the API configuration.`
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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

  // Send message to appropriate API based on mode
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    if (usePdfMode && !pdfUploaded) {
      setError("Please upload a PDF file first before sending messages");
      return;
    }

    // Add user message to chat
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
        // Use PDF AI API for PDF mode
        aiResponseText = await callPdfAI(inputMessage);
        aiRole = "PDF AI Assistant";
        aiSource = "pdf-ai";
      } else {
        // Use Google Gemini AI for general AI mode
        aiResponseText = await callGeneralAI(inputMessage);
        aiRole = "Google Gemini";
        aiSource = "google-ai";
      }

      // Add AI response to chat
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

  // Toggle between PDF mode and General AI mode
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
        role: newMode ? "PDF AI Assistant" : "Google Gemini"
      };
      setMessages([welcomeMessage]);
    }
  };

  // Format timestamp for messages
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Pre-defined quick questions for user convenience
  const quickQuestions = [
    "What is JSX syntax?",
    "How to use props in React?",
    "Explain React component lifecycle",
    "What are React hooks?"
  ];

  // Handle quick question selection
  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  // Render closed chat button when chat is minimized
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

  // Main chat interface
  return (
    <div className={`ai-chat-container ${isExpanded ? 'expanded' : ''}`}>
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-title">
          {usePdfMode ? <FaFilePdf className="title-icon" /> : <FaBrain className="title-icon" />}
          <div>
            <h3>AI Assistant</h3>
            <span className="chat-subtitle">
              {usePdfMode ? "PDF AI" : "Google Gemini 2.0"} | {userInfo?.username || 'Guest'}
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

      {/* Mode Toggle Section */}
      <div className="mode-toggle-section">
        <div className="mode-toggle">
          <button 
            className={`mode-btn ${!usePdfMode ? 'active' : ''}`}
            onClick={() => handleModeToggle(false)}
          >
            <FaBrain />
            <span>Google Gemini</span>
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

      {/* PDF Upload Section - Only visible in PDF AI mode */}
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

      {/* Chat Messages Area */}
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
        
        {/* Loading indicator */}
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
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions - Only show in Google Gemini mode for new conversations */}
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

      {/* Chat Input Form */}
      <form className="chat-input-form" onSubmit={sendMessage}>
        <div className="input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              usePdfMode 
                ? (pdfUploaded ? "Ask about your PDF content..." : "Upload a PDF first to ask questions...")
                : "Ask Google Gemini anything..."
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