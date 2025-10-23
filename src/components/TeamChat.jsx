// src/components/TeamChat.js
import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaUser, FaCircle, FaUsers, FaCrown, FaUserTie, FaUserShield, FaUserAlt, FaExclamationTriangle } from 'react-icons/fa';
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
  const messagesEndRef = useRef(null);

  const rooms = [
    { id: 1, name: 'General Chat', description: 'Company-wide discussions', allowedRoles: ['HR', 'PROJECT_MANAGER', 'DIRECTOR', 'CTO', 'USER'] },
    { id: 2, name: 'HR Department', description: 'HR team discussions', allowedRoles: ['HR', 'DIRECTOR'] },
    { id: 3, name: 'IT Department', description: 'Technical discussions', allowedRoles: ['CTO', 'PROJECT_MANAGER'] },
    { id: 4, name: 'Management', description: 'Management team', allowedRoles: ['DIRECTOR', 'CTO', 'HR'] }
  ];

  // Check if user can access room - FIXED VERSION
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
      'DIRECTOR': '#F59E0B',
      'HR': '#EF4444',
      'CTO': '#3B82F6',
      'PROJECT_MANAGER': '#10B981',
      'USER': '#6B7280',
      'SYSTEM': '#8B5CF6'
    };
    return colors[role] || '#6B7280';
  };

  // Initialize WebSocket connection - NATIVE WEBSOCKET
  const connectWebSocket = () => {
    try {
      console.log('🔌 Connecting to WebSocket...');
      setConnectionError('');
      
      // Use native WebSocket (remove SockJS)
      const client = new Client({
        brokerURL: 'ws://localhost:8080/ws-chat/websocket', // Native WebSocket endpoint
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
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
          
          // Try alternative endpoint after 2 seconds
          setTimeout(() => {
            if (!connected) {
              connectWithAlternativeEndpoint();
            }
          }, 2000);
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

  // Alternative connection method
  const connectWithAlternativeEndpoint = () => {
    try {
      console.log('🔄 Trying alternative WebSocket endpoint...');
      
      const client = new Client({
        brokerURL: 'ws://localhost:8080/ws-chat', // Try without /websocket
        reconnectDelay: 5000,
        onConnect: () => {
          console.log('✅ Connected via alternative endpoint');
          setConnected(true);
          setConnectionError('');
          subscribeToRoom(currentRoom);
        },
        onWebSocketError: (error) => {
          console.error('❌ Alternative endpoint also failed:', error);
          setConnectionError('Both WebSocket endpoints failed. Check if Spring Boot is running.');
        }
      });

      client.activate();
      setStompClient(client);
    } catch (error) {
      console.error('❌ Alternative connection failed:', error);
    }
  };

  // Subscribe to a specific room
  const subscribeToRoom = (roomId) => {
    if (!stompClient || !stompClient.connected) {
      console.log('STOMP client not connected, cannot subscribe');
      return;
    }

    try {
      stompClient.subscribe(`/topic/chat/${roomId}`, (message) => {
        console.log('📨 Received message:', message);
        const newMessage = JSON.parse(message.body);
        setMessages(prev => [newMessage, ...prev]);
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
      
      const response = await fetch(`http://localhost:8080/chat/messages/${roomId}`);
      
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
      roomId: currentRoom
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

  // Handle room change - UPDATED
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages(currentRoom);
    connectWebSocket();

    return () => {
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
    <div className="team-chat-container">
      <div className="chat-layout">
        {/* Sidebar with rooms */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h3>Chat Rooms</h3>
            <div className="connection-status">
              <FaCircle className={connected ? 'status-connected' : 'status-disconnected'} />
              <span>{connected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
          
          <div className="room-list">
            {rooms.map(room => {
              const canAccess = canAccessRoom(room);
              return (
                <div
                  key={room.id}
                  className={`room-item ${currentRoom === room.id ? 'active' : ''} ${!canAccess ? 'disabled' : ''}`}
                  onClick={() => canAccess && handleRoomChange(room.id)}
                  title={!canAccess ? 'You do not have access to this room' : ''}
                >
                  <div 
                    className="room-color" 
                    style={{ backgroundColor: getRoleColor(room.allowedRoles[0]) }}
                  ></div>
                  <div className="room-info">
                    <div className="room-name">
                      {room.name}
                      {!canAccess && <span className="access-restricted"> 🔒</span>}
                    </div>
                    <div className="room-description">{room.description}</div>
                    <div className="room-roles">
                      {room.allowedRoles.join(', ')}
                    </div>
                  </div>
                  {currentRoom === room.id && (
                    <div className="active-indicator"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Connection Error Display */}
          {connectionError && (
            <div className="connection-error">
              <FaExclamationTriangle />
              <div className="error-message">
                <strong>Connection Issue:</strong>
                <span>{connectionError}</span>
              </div>
            </div>
          )}

          <div className="user-profile-sidebar">
            <div 
              className="user-avatar"
              style={{ backgroundColor: getRoleColor(user?.role) }}
            >
              {React.createElement(getRoleIcon(user?.role))}
            </div>
            <div className="user-details">
              <div className="user-role-main">{user?.role || 'USER'}</div>
              <div className="user-status">
                <FaCircle className={connected ? 'status-online' : 'status-offline'} />
                {connected ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>
        </div>

        {/* Main chat area */}
        <div className="chat-main">
          <div className="chat-header">
            <div className="room-header">
              <h2>{rooms.find(r => r.id === currentRoom)?.name}</h2>
              <p>{rooms.find(r => r.id === currentRoom)?.description}</p>
              <div className="room-access-info">
                Access: {rooms.find(r => r.id === currentRoom)?.allowedRoles.join(', ')}
              </div>
            </div>
            <div className="online-count">
              <FaUsers />
              <span>Status: {connected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>

          <div className="messages-container">
            {loading ? (
              <div className="loading-messages">
                <div className="loading-spinner"></div>
                <p>Loading messages...</p>
              </div>
            ) : (
              <>
                <div className="messages-list">
                  {messages.length === 0 ? (
                    <div className="no-messages">
                      <FaUsers className="no-messages-icon" />
                      <h3>No messages yet</h3>
                      <p>Be the first to start the conversation!</p>
                      {!connected && (
                        <p className="connection-hint">
                          Make sure your backend is running on http://localhost:8080
                        </p>
                      )}
                    </div>
                  ) : (
                    Object.entries(messageGroups).map(([date, dateMessages]) => (
                      <div key={date}>
                        <div className="date-divider">
                          <span>{date}</span>
                        </div>
                        {dateMessages.map(message => {
                          const RoleIcon = getRoleIcon(message.senderRole);
                          const isOwnMessage = message.senderRole === user?.role;
                          
                          return (
                            <div
                              key={message.id}
                              className={`message ${isOwnMessage ? 'own-message' : ''}`}
                            >
                              <div 
                                className="message-avatar"
                                style={{ backgroundColor: getRoleColor(message.senderRole) }}
                              >
                                <RoleIcon />
                              </div>
                              <div className="message-content">
                                <div className="message-header">
                                  <span className="sender-role">
                                    {message.senderRole}
                                    {isOwnMessage && ' (You)'}
                                  </span>
                                  <span className="message-time">
                                    {formatTime(message.timestamp)}
                                  </span>
                                </div>
                                <div className="message-text">{message.content}</div>
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

          <div className="message-input-container">
            <div className="input-wrapper">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={connected 
                  ? `Type your message as ${user?.role || 'USER'}...` 
                  : 'Connecting to chat server...'
                }
                disabled={!connected}
                className="message-input"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !connected}
                className="send-button"
                style={{ backgroundColor: getRoleColor(user?.role) }}
              >
                <FaPaperPlane />
              </button>
            </div>
            <div className="input-hint">
              {connected 
                ? `Press Enter to send • You are chatting as: ${user?.role || 'USER'}`
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