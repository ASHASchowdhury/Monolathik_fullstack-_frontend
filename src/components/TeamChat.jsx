// src/components/TeamChat.js
import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaUser, FaCircle, FaUsers, FaCrown, FaUserTie, FaUserShield, FaUserAlt, FaExclamationTriangle, FaMoon, FaSun } from 'react-icons/fa';
import { Client } from '@stomp/stompjs';
import './TeamChat.css';

const TeamChat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentRoom, setCurrentRoom] = useState(1);
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);

  const rooms = [
    { id: 1, name: 'General Chat', description: 'Company-wide discussions', allowedRoles: ['HR', 'PROJECT_MANAGER', 'DIRECTOR', 'CTO', 'USER'] },
    { id: 2, name: 'HR Department', description: 'HR team discussions', allowedRoles: ['HR', 'DIRECTOR'] },
    { id: 3, name: 'IT Department', description: 'Technical discussions', allowedRoles: ['CTO', 'PROJECT_MANAGER'] },
    { id: 4, name: 'Management', description: 'Management team', allowedRoles: ['DIRECTOR', 'CTO', 'HR'] }
  ];

  // Get proper display names for roles
  const getRoleDisplayName = (role) => {
    const roleNames = {
      'DIRECTOR': 'Director',
      'HR': 'HR Manager', 
      'CTO': 'CTO',
      'PROJECT_MANAGER': 'Project Manager',
      'USER': 'Team Member'
    };
    return roleNames[role] || role;
  };

  // Get user display name for current user
  const getUserDisplayName = () => {
    return user?.username || user?.name || getRoleDisplayName(user?.role);
  };

  // Get sender display name from message
  const getSenderDisplayName = (message) => {
    // Use senderName from backend if available
    if (message.senderName) {
      return message.senderName;
    }
    // Fallback to role-based name
    return getRoleDisplayName(message.senderRole);
  };

  // Check if user can access room
  const canAccessRoom = (room) => {
    if (!room || !user?.role) return false;
    return room.allowedRoles.includes(user.role);
  };

  // Get role icon
  const getRoleIcon = (role) => {
    const icons = {
      'DIRECTOR': FaCrown,
      'HR': FaUserShield,
      'CTO': FaUserTie,
      'PROJECT_MANAGER': FaUserAlt,
      'USER': FaUser
    };
    return icons[role] || FaUser;
  };

  // Get role color
  const getRoleColor = (role) => {
    const colors = {
      'DIRECTOR': '#FF6B35',
      'HR': '#00A8E8', 
      'CTO': '#9C27B0',
      'PROJECT_MANAGER': '#4CAF50',
      'USER': '#607D8B'
    };
    return colors[role] || '#607D8B';
  };

  // Get connection headers with username
  const getConnectionHeaders = () => {
    return {
      'X-Role': user?.role || 'USER',
      'X-Username': getUserDisplayName()
    };
  };

  // Initialize WebSocket connection
  const connectWebSocket = () => {
    try {
      console.log('🔌 Connecting to WebSocket...');
      setConnectionError('');
      
      const client = new Client({
        brokerURL: 'ws://localhost:8080/ws-chat/websocket',
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        
        // ADD CONNECTION HEADERS with username
        connectHeaders: getConnectionHeaders(),
        
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        onConnect: () => {
          console.log('✅ WebSocket connected successfully');
          setConnected(true);
          setConnectionError('');
          subscribeToRoom(currentRoom);
        },
        onStompError: (frame) => {
          console.error('❌ STOMP error:', frame);
          setConnectionError(`STOMP Error: ${frame.headers?.message || 'Unknown error'}`);
          setConnected(false);
        },
        onWebSocketError: (error) => {
          console.error('❌ WebSocket error:', error);
          setConnectionError('Failed to connect to chat server. Make sure backend is running on port 8080.');
          setConnected(false);
        },
        onDisconnect: () => {
          console.log('🔌 WebSocket disconnected');
          setConnected(false);
        }
      });

      client.activate();
      setStompClient(client);

    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      setConnectionError('Failed to initialize WebSocket connection.');
      setConnected(false);
    }
  };

  // Subscribe to a specific room
  const subscribeToRoom = (roomId) => {
    if (!stompClient || !stompClient.connected) {
      console.log('STOMP client not connected, cannot subscribe');
      return;
    }

    try {
      // Unsubscribe from previous subscription to prevent duplicates
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        console.log('🔴 Unsubscribed from previous room');
      }

      subscriptionRef.current = stompClient.subscribe(`/topic/chat/${roomId}`, (message) => {
        console.log('📨 Received message:', message);
        try {
          const newMessage = JSON.parse(message.body);
          
          // Check if message already exists to prevent duplicates
          setMessages(prev => {
            const messageExists = prev.some(msg => 
              msg.id === newMessage.id || 
              (msg.content === newMessage.content && 
               msg.senderRole === newMessage.senderRole && 
               Math.abs(new Date(msg.timestamp) - new Date(newMessage.timestamp)) < 1000)
            );
            
            if (!messageExists) {
              return [newMessage, ...prev];
            }
            return prev;
          });
        } catch (error) {
          console.error('❌ Error parsing message:', error);
        }
      });
      
      console.log(`✅ Subscribed to room ${roomId}`);
      
    } catch (error) {
      console.error('❌ Subscription error:', error);
    }
  };

  // Fetch messages from REST API
  const fetchMessages = async (roomId) => {
    try {
      setLoading(true);
      console.log(`📡 Fetching messages for room ${roomId}`);
      
      const response = await fetch(`http://localhost:8080/chat/messages/${roomId}`, {
        headers: getConnectionHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📨 Fetched messages:', data);
      setMessages(data);
      
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      setConnectionError('Failed to load messages. Make sure backend is running.');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Send message via WebSocket
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    if (!stompClient || !connected) {
      setConnectionError('Not connected to chat server. Please wait for connection.');
      return;
    }

    const messageData = {
      content: newMessage.trim(),
      senderRole: user?.role || 'USER',
      senderName: getUserDisplayName(), // Use proper name
      roomId: currentRoom,
      timestamp: new Date().toISOString()
    };

    console.log('📤 Sending message:', messageData);

    try {
      stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(messageData)
      });
      
      setNewMessage('');
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setConnectionError('Failed to send message. Please try again.');
    }
  };

  // Handle room change
  const handleRoomChange = (roomId) => {
    const targetRoom = rooms.find(r => r.id === roomId);
    
    if (!targetRoom) {
      console.error('Room not found:', roomId);
      return;
    }
    
    if (!canAccessRoom(targetRoom)) {
      alert(`You do not have permission to access the ${targetRoom.name}`);
      return;
    }
    
    console.log(`Switching to room: ${targetRoom.name}`);
    setCurrentRoom(roomId);
    setMessages([]);
    fetchMessages(roomId);
    
    if (connected && stompClient) {
      subscribeToRoom(roomId);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages(currentRoom);
    connectWebSocket();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = formatDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className={`team-chat-app ${darkMode ? 'chat-dark' : 'chat-light'}`}>
      <div className="chat-app-layout">
        {/* Sidebar with rooms */}
        <div className="chat-app-sidebar">
          <div className="chat-sidebar-header">
            <div className="chat-header-top">
              <h3 className="chat-sidebar-title">Chat Rooms</h3>
              <button 
                className="chat-theme-toggle"
                onClick={toggleDarkMode}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
            </div>
            <div className="chat-connection-status">
              <FaCircle className={connected ? 'chat-status-connected' : 'chat-status-disconnected'} />
              <span className="chat-status-text">{connected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
          
          <div className="chat-room-list">
            {rooms.map(room => {
              const canAccess = canAccessRoom(room);
              return (
                <div
                  key={room.id}
                  className={`chat-room-item ${currentRoom === room.id ? 'chat-room-active' : ''} ${!canAccess ? 'chat-room-disabled' : ''}`}
                  onClick={() => canAccess && handleRoomChange(room.id)}
                  title={!canAccess ? 'You do not have access to this room' : ''}
                >
                  <div 
                    className="chat-room-color" 
                    style={{ backgroundColor: getRoleColor(room.allowedRoles[0]) }}
                  ></div>
                  <div className="chat-room-info">
                    <div className="chat-room-name">
                      {room.name}
                      {!canAccess && <span className="chat-room-lock"> 🔒</span>}
                    </div>
                    <div className="chat-room-desc">{room.description}</div>
                    <div className="chat-room-roles">
                      {room.allowedRoles.map(role => getRoleDisplayName(role)).join(', ')}
                    </div>
                  </div>
                  {currentRoom === room.id && (
                    <div className="chat-active-indicator"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Connection Error Display */}
          {connectionError && (
            <div className="chat-connection-error">
              <FaExclamationTriangle />
              <div className="chat-error-message">
                <strong>Connection Issue:</strong>
                <span>{connectionError}</span>
              </div>
            </div>
          )}

          <div className="chat-user-profile">
            <div 
              className="chat-user-avatar"
              style={{ backgroundColor: getRoleColor(user?.role) }}
            >
              {React.createElement(getRoleIcon(user?.role))}
            </div>
            <div className="chat-user-details">
              <div className="chat-user-name">{getUserDisplayName()}</div>
              <div className="chat-user-role">{getRoleDisplayName(user?.role)}</div>
              <div className="chat-user-status">
                <FaCircle className={connected ? 'chat-status-online' : 'chat-status-offline'} />
                {connected ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>
        </div>

        {/* Main chat area */}
        <div className="chat-app-main">
          <div className="chat-main-header">
            <div className="chat-current-room">
              <h2 className="chat-room-title">{rooms.find(r => r.id === currentRoom)?.name}</h2>
              <p className="chat-room-subtitle">{rooms.find(r => r.id === currentRoom)?.description}</p>
              <div className="chat-room-access">
                Access: {rooms.find(r => r.id === currentRoom)?.allowedRoles.map(role => getRoleDisplayName(role)).join(', ')}
              </div>
            </div>
            <div className="chat-online-indicator">
              <FaUsers />
              <span>Status: {connected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>

          <div className="chat-messages-area">
            {loading ? (
              <div className="chat-loading">
                <div className="chat-loading-spinner"></div>
                <p className="chat-loading-text">Loading messages...</p>
              </div>
            ) : (
              <>
                <div className="chat-messages-list">
                  {messages.length === 0 ? (
                    <div className="chat-no-messages">
                      <FaUsers className="chat-no-messages-icon" />
                      <h3 className="chat-no-messages-title">No messages yet</h3>
                      <p className="chat-no-messages-desc">Be the first to start the conversation!</p>
                      {!connected && (
                        <p className="chat-connection-hint">
                          Make sure your backend is running on http://localhost:8080
                        </p>
                      )}
                    </div>
                  ) : (
                    Object.entries(messageGroups).map(([date, dateMessages]) => (
                      <div key={date}>
                        <div className="chat-date-divider">
                          <span>{date}</span>
                        </div>
                        {dateMessages.map(message => {
                          const RoleIcon = getRoleIcon(message.senderRole);
                          const isOwnMessage = message.senderRole === user?.role;
                          const senderDisplayName = getSenderDisplayName(message);
                          
                          return (
                            <div
                              key={message.id || `${message.timestamp}-${message.content}`}
                              className={`chat-message ${isOwnMessage ? 'chat-message-own' : ''}`}
                            >
                              <div 
                                className="chat-message-avatar"
                                style={{ backgroundColor: getRoleColor(message.senderRole) }}
                              >
                                <RoleIcon />
                              </div>
                              <div className="chat-message-content">
                                <div className="chat-message-header">
                                  <span className="chat-sender-name">{senderDisplayName}</span>
                                  {!isOwnMessage && (
                                    <span className="chat-sender-role">
                                      {getRoleDisplayName(message.senderRole)}
                                    </span>
                                  )}
                                  <span className="chat-message-time">
                                    {formatTime(message.timestamp)}
                                  </span>
                                </div>
                                <div className="chat-message-text">{message.content}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </>
            )}
          </div>

          <div className="chat-input-section">
            <div className="chat-input-wrapper">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={connected 
                  ? `Type your message as ${getUserDisplayName()}...` 
                  : 'Connecting to chat server...'
                }
                disabled={!connected}
                className="chat-message-input"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !connected}
                className="chat-send-button"
                style={{ backgroundColor: getRoleColor(user?.role) }}
              >
                <FaPaperPlane />
              </button>
            </div>
            <div className="chat-input-hint">
              {connected 
                ? `Press Enter to send • You are chatting as: ${getUserDisplayName()}`
                : 'Trying to connect to chat server...'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamChat;