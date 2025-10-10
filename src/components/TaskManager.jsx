import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaTasks,
  FaPlus,
  FaSearch,
  FaFilter,
  FaUserCheck,
  FaUserPlus,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPlayCircle,
  FaEdit,
  FaTrash,
  FaEye,
  FaCalendarAlt,
  FaUser,
  FaFlag,
  FaChartBar
} from "react-icons/fa";
import "./TaskManager.css";

function TaskManager() {
  const [activeView, setActiveView] = useState("all-tasks");
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const API_BASE = "http://localhost:8080";

  // Task status and priority options based on your API
  const TASK_STATUS = {
    PENDING: "PENDING",
    IN_PROGRESS: "IN_PROGRESS", 
    COMPLETED: "COMPLETED"
  };

  const TASK_PRIORITY = {
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
    URGENT: "URGENT"
  };

  // Fetch tasks and employees
  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, [activeView]);

  const getAuthConfig = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return {
      auth: {
        username: user?.username || 'hr',
        password: 'hr123'
      }
    };
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      
      let endpoint = "/tasks";
      if (activeView === "my-tasks") endpoint = "/tasks/assignee/30"; // Using sample employee ID
      if (activeView === "created-by-me") endpoint = "/tasks"; // Adjust based on your API

      const response = await axios.get(`${API_BASE}${endpoint}`, getAuthConfig());
      console.log("Tasks response:", response.data);
      setTasks(response.data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. " + (err.response?.data?.message || ""));
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE}/employees`, getAuthConfig());
      console.log("Available employees:", response.data);
      setEmployees(response.data || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
    }
  };

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Create new task
  const createTask = async (taskData) => {
    try {
      console.log("Creating task:", taskData);
      
      const response = await axios.post(`${API_BASE}/tasks`, taskData, getAuthConfig());
      console.log("Task created:", response.data);
      
      setShowTaskForm(false);
      fetchTasks();
      setError("");
    } catch (err) {
      console.error("Error creating task:", err);
      setError(err.response?.data?.message || "Failed to create task.");
    }
  };

  // Update task
  const updateTask = async (taskId, taskData) => {
    try {
      await axios.put(`${API_BASE}/tasks/${taskId}`, taskData, getAuthConfig());
      setEditingTask(null);
      fetchTasks();
      setError("");
    } catch (err) {
      console.error("Error updating task:", err);
      setError(err.response?.data?.message || "Failed to update task.");
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId, status) => {
    try {
      // Using query parameter as shown in your API
      await axios.patch(`${API_BASE}/tasks/${taskId}/status?status=${status}`, {}, getAuthConfig());
      fetchTasks();
      setError("");
    } catch (err) {
      console.error("Error updating task status:", err);
      setError(err.response?.data?.message || "Failed to update task status.");
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE}/tasks/${taskId}`, getAuthConfig());
      fetchTasks();
      setError("");
    } catch (err) {
      console.error("Error deleting task:", err);
      setError(err.response?.data?.message || "Failed to delete task.");
    }
  };

  // Get status icon and color
  const getStatusIcon = (status) => {
    switch (status) {
      case TASK_STATUS.PENDING:
        return <FaClock className="status-icon pending" />;
      case TASK_STATUS.IN_PROGRESS:
        return <FaPlayCircle className="status-icon in-progress" />;
      case TASK_STATUS.COMPLETED:
        return <FaCheckCircle className="status-icon completed" />;
      default:
        return <FaClock className="status-icon pending" />;
    }
  };

  // Get priority icon and color
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case TASK_PRIORITY.LOW:
        return <FaFlag className="priority-icon low" />;
      case TASK_PRIORITY.MEDIUM:
        return <FaFlag className="priority-icon medium" />;
      case TASK_PRIORITY.HIGH:
        return <FaFlag className="priority-icon high" />;
      case TASK_PRIORITY.URGENT:
        return <FaExclamationTriangle className="priority-icon urgent" />;
      default:
        return <FaFlag className="priority-icon medium" />;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if task is overdue
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  // Task Card Component
  const TaskCard = ({ task }) => (
    <div className="task-card">
      <div className="task-header">
        <div className="task-title-section">
          <h3>{task.title}</h3>
          <div className="task-meta">
            <span className={`priority-badge ${task.priority?.toLowerCase()}`}>
              {getPriorityIcon(task.priority)}
              {task.priority}
            </span>
            <span className={`status-badge ${task.status?.toLowerCase()}`}>
              {getStatusIcon(task.status)}
              {task.status?.replace('_', ' ')}
            </span>
            {isOverdue(task.dueDate) && task.status !== TASK_STATUS.COMPLETED && (
              <span className="overdue-badge">Overdue</span>
            )}
          </div>
        </div>
        <div className="task-actions">
          <button 
            className="action-btn view-btn"
            onClick={() => setSelectedTask(task)}
            title="View Details"
          >
            <FaEye />
          </button>
          <button 
            className="action-btn edit-btn"
            onClick={() => setEditingTask(task)}
            title="Edit Task"
          >
            <FaEdit />
          </button>
          <button 
            className="action-btn delete-btn"
            onClick={() => deleteTask(task.id)}
            title="Delete Task"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      <div className="task-body">
        <p className="task-description">{task.description}</p>
        
        <div className="task-details">
          <div className="detail-item">
            <FaCalendarAlt className="detail-icon" />
            <span className={isOverdue(task.dueDate) && task.status !== TASK_STATUS.COMPLETED ? "overdue" : ""}>
              Due: {formatDate(task.dueDate)}
            </span>
          </div>
          <div className="detail-item">
            <FaClock className="detail-icon" />
            <span>Est: {task.estimatedHours}h</span>
          </div>
          <div className="detail-item">
            <FaUser className="detail-icon" />
            <span>Assigned to: Employee #{task.assignedToId}</span>
          </div>
        </div>
      </div>

      <div className="task-footer">
        <div className="task-id">
          <small>Task ID: #{task.id}</small>
        </div>
        <div className="status-actions">
          {task.status !== TASK_STATUS.COMPLETED && (
            <>
              {task.status === TASK_STATUS.PENDING && (
                <button 
                  className="btn-start"
                  onClick={() => updateTaskStatus(task.id, TASK_STATUS.IN_PROGRESS)}
                >
                  Start Task
                </button>
              )}
              {task.status === TASK_STATUS.IN_PROGRESS && (
                <button 
                  className="btn-complete"
                  onClick={() => updateTaskStatus(task.id, TASK_STATUS.COMPLETED)}
                >
                  Mark Complete
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Task Form Component
  const TaskForm = ({ task, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || TASK_PRIORITY.MEDIUM,
      dueDate: task?.dueDate || "",
      estimatedHours: task?.estimatedHours || 1,
      assignedToId: task?.assignedToId || ""
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Prepare data for backend
      const submitData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate,
        estimatedHours: parseInt(formData.estimatedHours),
        assignedToId: formData.assignedToId ? parseInt(formData.assignedToId) : null
      };
      
      console.log("Submitting task data:", submitData);
      onSave(submitData);
    };

    return (
      <div className="task-form-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>
            <button className="modal-close" onClick={onCancel}>×</button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                placeholder="Enter task title"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                placeholder="Enter task description"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value={TASK_PRIORITY.LOW}>Low</option>
                  <option value={TASK_PRIORITY.MEDIUM}>Medium</option>
                  <option value={TASK_PRIORITY.HIGH}>High</option>
                  <option value={TASK_PRIORITY.URGENT}>Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label>Estimated Hours</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({...formData, estimatedHours: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Assign To Employee ID</label>
                <select
                  value={formData.assignedToId}
                  onChange={(e) => setFormData({...formData, assignedToId: e.target.value})}
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - ID: {emp.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {task ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Task Details Modal
  const TaskDetailsModal = ({ task, onClose }) => (
    <div className="task-details-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Task Details</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="task-details-content">
          <div className="detail-section">
            <h3>{task.title}</h3>
            <div className="detail-meta">
              <span className={`priority-badge ${task.priority?.toLowerCase()}`}>
                {getPriorityIcon(task.priority)}
                {task.priority} Priority
              </span>
              <span className={`status-badge ${task.status?.toLowerCase()}`}>
                {getStatusIcon(task.status)}
                {task.status?.replace('_', ' ')}
              </span>
              {isOverdue(task.dueDate) && task.status !== TASK_STATUS.COMPLETED && (
                <span className="overdue-badge">Overdue</span>
              )}
            </div>
          </div>

          <div className="detail-section">
            <h4>Description</h4>
            <p>{task.description || "No description provided"}</p>
          </div>

          <div className="details-grid">
            <div className="detail-item">
              <label>Due Date</label>
              <p className={isOverdue(task.dueDate) && task.status !== TASK_STATUS.COMPLETED ? "overdue" : ""}>
                {formatDate(task.dueDate)}
              </p>
            </div>
            <div className="detail-item">
              <label>Estimated Hours</label>
              <p>{task.estimatedHours} hours</p>
            </div>
            <div className="detail-item">
              <label>Task ID</label>
              <p>#{task.id}</p>
            </div>
            <div className="detail-item">
              <label>Status</label>
              <p className={`status-text ${task.status?.toLowerCase()}`}>
                {task.status?.replace('_', ' ')}
              </p>
            </div>
            <div className="detail-item full-width">
              <label>Assigned To</label>
              <p>Employee #{task.assignedToId}</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Close
          </button>
          {task.status !== TASK_STATUS.COMPLETED && (
            <div className="status-actions">
              {task.status === TASK_STATUS.PENDING && (
                <button 
                  className="btn-start"
                  onClick={() => {
                    updateTaskStatus(task.id, TASK_STATUS.IN_PROGRESS);
                    onClose();
                  }}
                >
                  Start Task
                </button>
              )}
              {task.status === TASK_STATUS.IN_PROGRESS && (
                <button 
                  className="btn-complete"
                  onClick={() => {
                    updateTaskStatus(task.id, TASK_STATUS.COMPLETED);
                    onClose();
                  }}
                >
                  Mark Complete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="task-manager">
      {/* Header */}
      <div className="task-header">
        <div className="header-content">
          <div className="header-title">
            <h2>Task Management</h2>
            <span className="task-count">
              {filteredTasks.length} of {tasks.length} tasks
            </span>
          </div>
          <div className="header-actions">
            <button 
              className="btn-primary"
              onClick={() => setShowTaskForm(true)}
            >
              <FaPlus /> Create Task
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="task-nav">
        <button
          className={`nav-tab ${activeView === "all-tasks" ? "active" : ""}`}
          onClick={() => setActiveView("all-tasks")}
        >
          <FaTasks /> All Tasks
        </button>
        <button
          className={`nav-tab ${activeView === "my-tasks" ? "active" : ""}`}
          onClick={() => setActiveView("my-tasks")}
        >
          <FaUserCheck /> My Tasks
        </button>
        <button
          className={`nav-tab ${activeView === "priority" ? "active" : ""}`}
          onClick={() => setActiveView("priority")}
        >
          <FaFlag /> By Priority
        </button>
      </div>

      {/* Filters and Search */}
      <div className="task-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <FaFilter className="filter-icon" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value={TASK_STATUS.PENDING}>Pending</option>
            <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
            <option value={TASK_STATUS.COMPLETED}>Completed</option>
          </select>
        </div>
        <div className="filter-group">
          <FaFlag className="filter-icon" />
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priority</option>
            <option value={TASK_PRIORITY.LOW}>Low</option>
            <option value={TASK_PRIORITY.MEDIUM}>Medium</option>
            <option value={TASK_PRIORITY.HIGH}>High</option>
            <option value={TASK_PRIORITY.URGENT}>Urgent</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <FaExclamationTriangle />
          {error}
        </div>
      )}

      {/* Tasks Grid */}
      <div className="tasks-grid">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading tasks...</p>
          </div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <div className="empty-state">
            <FaTasks className="empty-icon" />
            <h3>No tasks found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showTaskForm && (
        <TaskForm
          task={null}
          onSave={createTask}
          onCancel={() => setShowTaskForm(false)}
        />
      )}

      {editingTask && (
        <TaskForm
          task={editingTask}
          onSave={(data) => updateTask(editingTask.id, data)}
          onCancel={() => setEditingTask(null)}
        />
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

export default TaskManager;