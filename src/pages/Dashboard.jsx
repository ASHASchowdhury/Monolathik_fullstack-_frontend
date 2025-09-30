import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaUserCheck,
  FaComments,
  FaBars,
  FaTimes,
  FaChartLine,
  FaUserPlus,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaCog
} from "react-icons/fa";
import EmployeeForm from "../components/EmployeeForm";
import EmployeeList from "../components/EmployeeList";
import DepartmentForm from "../components/DepartmentFrom";
import DepartmentList from "../components/DepartmentList";
import "../styles/Dashboard.css";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    activeEmployees: 0,
    inactiveEmployees: 0
  });
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [empRes, deptRes] = await Promise.all([
        axios.get("http://10.0.6.1:8080/employees"),
        axios.get("http://10.0.6.1:8080/departments")
      ]);

      const employeesData = empRes.data || [];
      const departmentsData = deptRes.data || [];

      setEmployees(employeesData);
      setDepartments(departmentsData);

      const activeCount = employeesData.filter(emp => emp.active).length;
      
      setStats({
        totalEmployees: employeesData.length,
        totalDepartments: departmentsData.length,
        activeEmployees: activeCount,
        inactiveEmployees: employeesData.length - activeCount
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setEmployees([]);
      setDepartments([]);
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

  // Chat System Component
  const ChatSystem = () => (
    <div className="chat-system">
      <div className="chat-header">
        <h3>Team Chat</h3>
        <span className="online-indicator">• Online</span>
      </div>
      <div className="chat-messages">
        <div className="message received">
          <div className="message-avatar">HR</div>
          <div className="message-content">
            <p>Welcome to the team dashboard! How can I help?</p>
            <span className="message-time">10:30 AM</span>
          </div>
        </div>
        <div className="message sent">
          <div className="message-content">
            <p>Looking for department reports</p>
            <span className="message-time">10:32 AM</span>
          </div>
        </div>
      </div>
      <div className="chat-input">
        <input type="text" placeholder="Type a message..." />
        <button className="send-btn">Send</button>
      </div>
    </div>
  );

  // Dashboard Stats Cards
  const StatCard = ({ title, value, icon, color, change }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
        {change && (
          <span className={`stat-change ${change > 0 ? 'positive' : 'negative'}`}>
            {change > 0 ? <FaArrowUp /> : <FaArrowDown />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );

  // Recent Activity Component
  const RecentActivity = () => (
    <div className="recent-activity">
      <h3>Recent Activity</h3>
      <div className="activity-list">
        {employees.slice(0, 5).map(emp => (
          <div key={emp.id} className="activity-item">
            <div className="activity-avatar">
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

  // Render active component based on tab
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
                title="Inactive Employees"
                value={stats.inactiveEmployees}
                icon={<FaExclamationTriangle />}
                color="orange"
                change={-3}
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

            <div className="chat-section">
              <ChatSystem />
            </div>
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
            {editingDepartment !== null ? (
              <DepartmentForm
                onDepartmentAdded={handleDepartmentAdded}
                editingDepartment={editingDepartment}
              />
            ) : (
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

      case "chat":
        return (
          <div className="tab-content">
            <div className="content-header">
              <h2>Team Chat</h2>
            </div>
            <ChatSystem />
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
            className={`nav-item ${activeTab === "active-employees" ? "active" : ""}`}
            onClick={() => setActiveTab("active-employees")}
          >
            <FaUserCheck />
            <span>Active Employees</span>
            <span className="nav-badge">{stats.activeEmployees}</span>
          </button>

          <button
            className={`nav-item ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            <FaComments />
            <span>Team Chat</span>
          </button>

          <div className="nav-divider"></div>

          <button className="nav-item">
            <FaCog />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "employees" && "Employee Management"}
              {activeTab === "departments" && "Department Management"}
              {activeTab === "active-employees" && "Active Employees"}
              {activeTab === "chat" && "Team Chat"}
            </h1>
            <p className="header-subtitle">
              {activeTab === "dashboard" && "Welcome to your HR Dashboard"}
              {activeTab === "employees" && "Manage your team members"}
              {activeTab === "departments" && "Organize your departments"}
              {activeTab === "active-employees" && "Currently active team members"}
              {activeTab === "chat" && "Communicate with your team"}
            </p>
          </div>
          <div className="header-right">
            <div className="user-profile">
              <div className="user-avatar">
                <FaUsers />
              </div>
              <span>Admin</span>
            </div>
          </div>
        </header>

        <main className="dashboard-content-area">
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
    </div>
  );
}

export default Dashboard;