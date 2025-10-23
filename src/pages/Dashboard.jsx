import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaUserCheck,
  FaBars,
  FaTimes,
  FaChartLine,
  FaUserPlus,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaCog,
  FaSignOutAlt,
  FaTasks,
  FaComments
} from "react-icons/fa";
import EmployeeForm from "../components/EmployeeForm";
import EmployeeList from "../components/EmployeeList";
import DepartmentForm from "../components/DepartmentFrom";
import DepartmentList from "../components/DepartmentList";
import TaskManager from "../components/TaskManager";
import AIChat from '../components/AIChat';
import TeamChat from '../components/TeamChat'; // ADD THIS
import "../styles/Dashboard.css";

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0
  });
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const API_BASE = "http://localhost:8080";

  const getAuthConfig = () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.warn('No user data found in localStorage');
        return { headers: {} };
      }
      
      const user = JSON.parse(userData);
      console.log('Auth headers - User:', user);
      
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

  useEffect(() => {
    console.log("Dashboard mounted, user:", user);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try { 
      setLoading(true);
      setApiError("");
      
      const config = getAuthConfig();
      console.log("Auth config for API calls:", config);

      const [empRes, deptRes, tasksRes] = await Promise.all([
        axios.get(`${API_BASE}/employees`, config).catch(err => {
          console.error("Error fetching employees:", err);
          return { data: [] };
        }),
        axios.get(`${API_BASE}/departments`, config).catch(err => {
          console.error("Error fetching departments:", err);
          return { data: [] };
        }),
        axios.get(`${API_BASE}/tasks`, config).catch(err => {
          console.error("Error fetching tasks:", err);
          return { data: [] };
        })
      ]);

      const employeesData = empRes.data || [];
      const departmentsData = deptRes.data || [];
      const tasksData = tasksRes.data || [];

      console.log("Fetched data:", {
        employees: employeesData.length,
        departments: departmentsData.length,
        tasks: tasksData.length
      });

      setEmployees(employeesData);
      setDepartments(departmentsData);
      setTasks(tasksData);

      const activeCount = employeesData.filter(emp => emp.active).length;
      const pendingTasks = tasksData.filter(task => !task.started && !task.completed).length;
      const inProgressTasks = tasksData.filter(task => task.started && !task.completed).length;
      const completedTasks = tasksData.filter(task => task.completed).length;
      
      setStats({
        totalEmployees: employeesData.length,
        totalDepartments: departmentsData.length,
        activeEmployees: activeCount,
        inactiveEmployees: employeesData.length - activeCount,
        totalTasks: tasksData.length,
        pendingTasks: pendingTasks,
        inProgressTasks: inProgressTasks,
        completedTasks: completedTasks
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      console.error("Error response:", error.response);
      
      if (error.response?.status === 403) {
        setApiError(`Access denied: You don't have permission to view this data. Your role: ${user?.role}`);
      } else if (error.response?.status === 401) {
        setApiError("Authentication failed. Please login again.");
        onLogout();
      } else if (error.code === 'ERR_NETWORK') {
        setApiError("Cannot connect to server. Please check if the backend is running.");
      } else {
        setApiError("Failed to load dashboard data. Please check your connection.");
      }
      
      setEmployees([]);
      setDepartments([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeAdded = () => {
    fetchDashboardData();
    setEditingEmployee(null);
  };

  const handleEmployeeDeleted = () => {
    fetchDashboardData();
  };

  const handleDepartmentAdded = () => {
    fetchDashboardData();
    setEditingDepartment(null);
  };

  const handleDepartmentDeleted = () => {
    fetchDashboardData();
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setActiveTab("employees");
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setActiveTab("departments");
  };

  const StatCard = ({ title, value, icon, color, change, subtitle }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
        {subtitle && <span className="stat-subtitle">{subtitle}</span>}
        {change && (
          <span className={`stat-change ${change > 0 ? 'positive' : 'negative'}`}>
            {change > 0 ? <FaArrowUp /> : <FaArrowDown />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );

  const RecentActivity = () => {
    const recentTasks = tasks.slice(0, 3);
    const recentEmployees = employees.slice(0, 2);
    
    return (
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {recentTasks.map(task => (
            <div key={task.id} className="activity-item">
              <div className="activity-avatar task">
                <FaTasks />
              </div>
              <div className="activity-content">
                <p><strong>New Task:</strong> {task.title}</p>
                <span className="activity-time">
                  {task.completed ? 'Completed' : task.started ? 'In Progress' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
          {recentEmployees.map(emp => (
            <div key={emp.id} className="activity-item">
              <div className="activity-avatar employee">
                <FaUsers />
              </div>
              <div className="activity-content">
                <p><strong>{emp.name}</strong> was {emp.active ? 'activated' : 'deactivated'}</p>
                <span className="activity-time">Today</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TaskOverview = () => (
    <div className="task-overview">
      <div className="task-overview-header">
        <h3>Task Overview</h3>
        <span className="task-summary">
          {stats.totalTasks} Total Tasks • {stats.completedTasks} Completed
        </span>
      </div>
      
      <div className="task-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: stats.totalTasks > 0 ? `${(stats.completedTasks / stats.totalTasks) * 100}%` : '0%' 
            }}
          ></div>
        </div>
        <div className="progress-stats">
          <span className="progress-text">
            Completion Rate: {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
          </span>
        </div>
      </div>

      <div className="task-quick-stats">
        <div className="quick-stat">
          <div className="stat-icon total">
            <FaTasks />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalTasks}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        
        <div className="quick-stat">
          <div className="stat-icon pending">
            <FaTasks />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.pendingTasks}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        
        <div className="quick-stat">
          <div className="stat-icon in-progress">
            <FaTasks />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.inProgressTasks || 0}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
        
        <div className="quick-stat">
          <div className="stat-icon completed">
            <FaTasks />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.completedTasks}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      <button 
        className="btn-primary full-width"
        onClick={() => setActiveTab("tasks")}
      >
        <FaTasks /> Open Task Manager
      </button>
    </div>
  );

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="dashboard-content">
            <div className="stats-grid">
              <StatCard
                title="Total Employees"
                value={stats.totalEmployees}
                icon={<FaUsers />}
                color="blue"
                change={5}
              />
              <StatCard
                title="Departments"
                value={stats.totalDepartments}
                icon={<FaBuilding />}
                color="green"
                change={2}
              />
              <StatCard
                title="Active Employees"
                value={stats.activeEmployees}
                icon={<FaUserCheck />}
                color="purple"
                change={8}
              />
              <StatCard
                title="Total Tasks"
                value={stats.totalTasks}
                subtitle={`${stats.pendingTasks} pending, ${stats.completedTasks} completed`}
                icon={<FaTasks />}
                color="orange"
                change={12}
              />
            </div>

            <div className="dashboard-grid">
              <div className="chart-section">
                <h3>Employee Distribution</h3>
                <div className="simple-chart">
                  {departments.map(dept => {
                    const deptEmployees = employees.filter(emp => 
                      emp.departmentDTO?.id === dept.id
                    ).length;
                    const percentage = stats.totalEmployees > 0 ? 
                      (deptEmployees / stats.totalEmployees) * 100 : 0;
                    
                    return (
                      <div key={dept.id} className="chart-item">
                        <div className="chart-label">
                          <span>{dept.name}</span>
                          <span>{deptEmployees} employees</span>
                        </div>
                        <div className="chart-bar">
                          <div 
                            className="chart-fill" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <RecentActivity />
            </div>

            <TaskOverview />
          </div>
        );

      case "employees":
        return (
          <div className="tab-content">
            <div className="content-header">
              <h2>Employee Management</h2>
              <button 
                className="add-btn"
                onClick={() => setEditingEmployee({})}
              >
                <FaUserPlus /> Add Employee
              </button>
            </div>
            {editingEmployee !== null ? (
              <EmployeeForm
                onEmployeeAdded={handleEmployeeAdded}
                selectedEmployee={editingEmployee}
                onUpdateComplete={handleEmployeeAdded}
              />
            ) : (
              <EmployeeList
                employees={employees}
                onEmployeeDeleted={handleEmployeeDeleted}
                onEditEmployee={handleEditEmployee}
              />
            )}
          </div>
        );

      case "departments":
        return (
          <div className="tab-content">
            <div className="content-header">
              <h2>Department Management</h2>
              <button 
                className="add-btn"
                onClick={() => setEditingDepartment({})}
              >
                <FaUserPlus /> Add Department
              </button>
            </div>
            
            <DepartmentForm
              onDepartmentAdded={handleDepartmentAdded}
              editingDepartment={editingDepartment}
            />
            
            {!editingDepartment && (
              <DepartmentList
                departments={departments}
                onDepartmentDeleted={handleDepartmentDeleted}
                onEditDepartment={handleEditDepartment}
              />
            )}
          </div>
        );

      case "active-employees":
        return (
          <div className="tab-content">
            <div className="content-header">
              <h2>Active Employees</h2>
              <span className="active-count">{stats.activeEmployees} Active Employees</span>
            </div>
            <EmployeeList
              employees={employees.filter(emp => emp.active)}
              onEmployeeDeleted={handleEmployeeDeleted}
              onEditEmployee={handleEditEmployee}
            />
          </div>
        );

      case "tasks":
        return (
          <div className="tab-content">
            <div className="content-header">
              <h2>Task Management</h2>
            </div>
            <TaskManager user={user} />
          </div>
        );

      case "team-chat":  // ADD THIS CASE
        return (
          <div className="tab-content">
            <div className="content-header">
              <h2>Team Chat</h2>
              <span className="active-count">Real-time messaging</span>
            </div>
            <TeamChat user={user} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>HR Dashboard</h2>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <FaTachometerAlt />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${activeTab === "employees" ? "active" : ""}`}
            onClick={() => setActiveTab("employees")}
          >
            <FaUsers />
            <span>Employees</span>
            <span className="nav-badge">{stats.totalEmployees}</span>
          </button>

          <button
            className={`nav-item ${activeTab === "departments" ? "active" : ""}`}
            onClick={() => setActiveTab("departments")}
          >
            <FaBuilding />
            <span>Departments</span>
            <span className="nav-badge">{stats.totalDepartments}</span>
          </button>

          <button
            className={`nav-item ${activeTab === "tasks" ? "active" : ""}`}
            onClick={() => setActiveTab("tasks")}
          >
            <FaTasks />
            <span>Tasks</span>
            <span className="nav-badge">{stats.totalTasks}</span>
          </button>

          {/* ADD TEAM CHAT BUTTON */}
          <button
            className={`nav-item ${activeTab === "team-chat" ? "active" : ""}`}
            onClick={() => setActiveTab("team-chat")}
          >
            <FaComments />
            <span>Team Chat</span>
            <span className="nav-badge live">Live</span>
          </button>

          <button
            className={`nav-item ${activeTab === "active-employees" ? "active" : ""}`}
            onClick={() => setActiveTab("active-employees")}
          >
            <FaUserCheck />
            <span>Active Employees</span>
            <span className="nav-badge">{stats.activeEmployees}</span>
          </button>

          <div className="nav-divider"></div>

          <button className="nav-item logout-btn" onClick={onLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "employees" && "Employee Management"}
              {activeTab === "departments" && "Department Management"}
              {activeTab === "tasks" && "Task Management"}
              {activeTab === "active-employees" && "Active Employees"}
              {activeTab === "team-chat" && "Team Chat"} {/* ADD THIS */}
            </h1>
            <p className="header-subtitle">
              {activeTab === "dashboard" && "Welcome to your HR Dashboard"}
              {activeTab === "employees" && "Manage your team members"}
              {activeTab === "departments" && "Organize your departments"}
              {activeTab === "tasks" && "Assign and track tasks"}
              {activeTab === "active-employees" && "Currently active team members"}
              {activeTab === "team-chat" && "Real-time team communication"} {/* ADD THIS */}
            </p>
          </div>
          <div className="header-right">
            <div className="user-profile">
              <div className="user-avatar">
                <FaUsers />
              </div>
              <div className="user-info">
                <span className="user-name">Welcome, {user?.name || user?.username}</span>
                <span className="user-role">{user?.role}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-content-area">
          {activeTab !== "dashboard" && (
            <div className="global-back-button">
              <button 
                className="back-btn"
                onClick={() => setActiveTab("dashboard")}
              >
                ← Back to Dashboard
              </button>
            </div>
          )}
          
          {apiError && (
            <div className="error-banner">
              <FaExclamationTriangle />
              {apiError}
            </div>
          )}
          
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading dashboard data...</p>
            </div>
          ) : (
            renderActiveComponent()
          )}
        </main>
      </div>

      {/* AI Chat Component */}
      <AIChat />
    </div>
  );
}

export default Dashboard;