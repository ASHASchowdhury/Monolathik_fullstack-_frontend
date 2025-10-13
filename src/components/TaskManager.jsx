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

  // Task priority options based on your API
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

  // NEW: Get employee name by ID
  const getEmployeeName = (employeeId) => {
    if (!employeeId) return "Unassigned";
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : `Employee #${employeeId}`;
  };

  // NEW: Get employee details by ID
  const getEmployeeDetails = (employeeId) => {
    if (!employeeId) return null;
    return employees.find(emp => emp.id === employeeId);
  };

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "pending" && !task.started && !task.completed) ||
                         (statusFilter === "in-progress" && task.started && !task.completed) ||
                         (statusFilter === "completed" && task.completed);
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

  // Start task - set started to true
  const startTask = async (taskId) => {
    try {
      const taskData = {
        started: true,
        completed: false
      };
      await axios.put(`${API_BASE}/tasks/${taskId}`, taskData, getAuthConfig());
      fetchTasks();
      setError("");
    } catch (err) {
      console.error("Error starting task:", err);
      setError(err.response?.data?.message || "Failed to start task.");
    }
  };

  // Complete task - set completed to true
  const completeTask = async (taskId) => {
    try {
      const taskData = {
        started: true,
        completed: true
      };
      await axios.put(`${API_BASE}/tasks/${taskId}`, taskData, getAuthConfig());
      fetchTasks();
      setError("");
    } catch (err) {
      console.error("Error completing task:", err);
      setError(err.response?.data?.message || "Failed to complete task.");
    }
  };

  // Reopen task - set completed to false
  const reopenTask = async (taskId) => {
    try {
      const taskData = {
        started: true,
        completed: false
      };
      await axios.put(`${API_BASE}/tasks/${taskId}`, taskData, getAuthConfig());
      fetchTasks();
      setError("");
    } catch (err) {
      console.error("Error reopening task:", err);
      setError(err.response?.data?.message || "Failed to reopen task.");
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

  // Get status based on started and completed booleans
  const getTaskStatus = (task) => {
    if (task.completed) return "completed";
    if (task.started) return "in-progress";
    return "pending";
  };

  // Get status icon and color
  const getStatusIcon = (task) => {
    const status = getTaskStatus(task);
    switch (status) {
      case "pending":
        return <FaClock className="status-icon pending" />;
      case "in-progress":
        return <FaPlayCircle className="status-icon in-progress" />;
      case "completed":
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
  const TaskCard = ({ task }) => {
    const status = getTaskStatus(task);
    
    return (
      <div className="task-card">
        <div className="task-header">
          <div className="task-title-section">
            <h3>{task.title}</h3>
            <div className="task-meta">
              <span className={`priority-badge ${task.priority?.toLowerCase()}`}>
                {getPriorityIcon(task.priority)}
                {task.priority}
              </span>
              <span className={`status-badge ${status}`}>
                {getStatusIcon(task)}
                {status.replace('-', ' ')}
              </span>
              {isOverdue(task.dueDate) && !task.completed && (
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
              <span className={isOverdue(task.dueDate) && !task.completed ? "overdue" : ""}>
                Due: {formatDate(task.dueDate)}
              </span>
            </div>
            <div className="detail-item">
              <FaClock className="detail-icon" />
              <span>Est: {task.estimatedHours}h</span>
            </div>
            <div className="detail-item">
              <FaUser className="detail-icon" />
              {/* UPDATED: Show employee name instead of ID */}
              <span>Assigned to: {getEmployeeName(task.assignedToId)}</span>
            </div>
          </div>
        </div>

        <div className="task-footer">
          <div className="task-id">
            <small>Task ID: #{task.id}</small>
          </div>
          <div className="status-actions">
            {!task.completed && (
              <>
                {!task.started && (
                  <button 
                    className="btn-start"
                    onClick={() => startTask(task.id)}
                  >
                    Start Task
                  </button>
                )}
                {task.started && (
                  <button 
                    className="btn-complete"
                    onClick={() => completeTask(task.id)}
                  >
                    Mark Complete
                  </button>
                )}
              </>
            )}
            {task.completed && (
              <button 
                className="btn-reopen"
                onClick={() => reopenTask(task.id)}
              >
                Reopen Task
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Task Form Component
  const TaskForm = ({ task, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || TASK_PRIORITY.MEDIUM,
      dueDate: task?.dueDate || "",
      estimatedHours: task?.estimatedHours || 1,
      assignedToId: task?.assignedToId || "",
      started: task?.started || false,
      completed: task?.completed || false
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
        assignedToId: formData.assignedToId ? parseInt(formData.assignedToId) : null,
        started: formData.started,
        completed: formData.completed
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
                <label>Assign To</label>
                <select
                  value={formData.assignedToId}
                  onChange={(e) => setFormData({...formData, assignedToId: e.target.value})}
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.position} (ID: {emp.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {task && (
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.started}
                      onChange={(e) => setFormData({...formData, started: e.target.checked})}
                    />
                    Task Started
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.completed}
                      onChange={(e) => setFormData({...formData, completed: e.target.checked})}
                    />
                    Task Completed
                  </label>
                </div>
              </div>
            )}

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
  const TaskDetailsModal = ({ task, onClose }) => {
    const status = getTaskStatus(task);
    const assignedEmployee = getEmployeeDetails(task.assignedToId);
    
    return (
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
                <span className={`status-badge ${status}`}>
                  {getStatusIcon(task)}
                  {status.replace('-', ' ')}
                </span>
                {isOverdue(task.dueDate) && !task.completed && (
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
                <p className={isOverdue(task.dueDate) && !task.completed ? "overdue" : ""}>
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
                <p className={`status-text ${status}`}>
                  {status.replace('-', ' ')}
                </p>
              </div>
              <div className="detail-item full-width">
                <label>Assigned To</label>
                {/* UPDATED: Show employee details */}
                {assignedEmployee ? (
                  <div className="user-info">
                    <div className="user-avatar">
                      <FaUser />
                    </div>
                    <div>
                      <strong>{assignedEmployee.name}</strong>
                      <p>{assignedEmployee.position} • ID: {assignedEmployee.id}</p>
                      <p>{assignedEmployee.email}</p>
                    </div>
                  </div>
                ) : (
                  <p>Unassigned</p>
                )}
              </div>
              <div className="detail-item">
                <label>Started</label>
                <p>{task.started ? 'Yes' : 'No'}</p>
              </div>
              <div className="detail-item">
                <label>Completed</label>
                <p>{task.completed ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-primary" onClick={onClose}>
              Close
            </button>
            <div className="status-actions">
              {!task.completed && (
                <>
                  {!task.started && (
                    <button 
                      className="btn-start"
                      onClick={() => {
                        startTask(task.id);
                        onClose();
                      }}
                    >
                      Start Task
                    </button>
                  )}
                  {task.started && (
                    <button 
                      className="btn-complete"
                      onClick={() => {
                        completeTask(task.id);
                        onClose();
                      }}
                    >
                      Mark Complete
                    </button>
                  )}
                </>
              )}
              {task.completed && (
                <button 
                  className="btn-reopen"
                  onClick={() => {
                    reopenTask(task.id);
                    onClose();
                  }}
                >
                  Reopen Task
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
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