import React, { useState } from "react";
import axios from "axios";
import {
  FaTrash,
  FaEye,
  FaEdit,
  FaUser,
  FaBuilding,
  FaVenusMars,
  FaPhone,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
  FaMale,
  FaFemale,
  FaNeuter,
  FaTint,
  FaCalendarAlt,
  FaTimes as FaClose
} from "react-icons/fa";
import "./EmployeeList.css";

function EmployeeList({ employees, onEmployeeDeleted, onEditEmployee }) {
  const [confirmDelete, setConfirmDelete] = useState({ show: false, empId: null, empName: "" });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // FIXED: Proper authentication headers
  const getAuthConfig = () => {
    try {
      // Get individual auth fields from localStorage
      const username = localStorage.getItem('username');
      const role = localStorage.getItem('userRole');
      const token = localStorage.getItem('authToken');
      
      console.log('Auth headers - Username:', username, 'Role:', role);
      
      if (!username || !role) {
        console.warn('Missing auth headers: username or role not found in localStorage');
        console.log('Available localStorage items:', Object.keys(localStorage));
        return { headers: {} };
      }
      
      const headers = {
        'X-Username': username,
        'X-Role': role
      };
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      return { headers };
    } catch (error) {
      console.error('Error getting auth config:', error);
      return { headers: {} };
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.departmentDTO?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && emp.active) ||
                         (statusFilter === "inactive" && !emp.active);
    return matchesSearch && matchesStatus;
  });

  const deleteEmployee = async (id) => {
    try {
      console.log('Attempting to delete employee ID:', id);
      const config = getAuthConfig();
      console.log('Request config:', config);
      
      const response = await axios.delete(`http://localhost:8080/employees/${id}`, config);
      console.log('Delete response:', response);
      
      if (response.status === 200) {
        onEmployeeDeleted();
        alert('Employee deleted successfully');
      }
    } catch (err) {
      console.error("Error deleting employee:", err);
      console.log('Full error response:', err.response);
      console.log('Error data:', err.response?.data);
      console.log('Error message:', err.response?.data?.message);
      
      if (err.response?.status === 403) {
        alert("Access denied: You don't have permission to delete employees.");
      } else if (err.response?.status === 500) {
        const errorMessage = err.response?.data?.message || err.response?.data || "Internal server error";
        alert("Server error: " + errorMessage);
      } else {
        alert("Error deleting employee: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleViewEmployee = (emp) => {
    setSelectedEmployee(emp);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const getGenderIcon = (gender) => {
    switch (gender?.toLowerCase()) {
      case "male":
        return <FaMale className="gender-icon male" />;
      case "female":
        return <FaFemale className="gender-icon female" />;
      default:
        return <FaNeuter className="gender-icon other" />;
    }
  };

  const calculateAge = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const today = new Date();
      const birthDate = new Date(dateString);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch  {
      return 'N/A';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="modern-employee-list">
      <div className="list-header">
        <div className="header-content">
          <div className="header-title">
            <h2>Employee Directory</h2>
            <span className="employee-count">{filteredEmployees.length} of {employees.length} employees</span>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <FaFilter className="filter-icon" />
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {/* Debug button - remove in production */}
          </div>
        </div>
      </div>

      <div className="employee-grid">
        {filteredEmployees.map((emp) => (
          <div key={emp.id} className={`modern-employee-card ${!emp.active ? 'inactive-employee' : ''}`}>
            <div className="card-header">
              <div className="employee-avatar">
                <FaUser />
              </div>
              <div className="employee-info">
                <h3>{emp.name || "Unnamed Employee"}</h3>
                <span className="employee-id">#{emp.id}</span>
              </div>
              <div className={`status-indicator ${emp.active ? 'active' : 'inactive'}`}>
                {emp.active ? <FaCheck /> : <FaTimes />}
              </div>
            </div>

            <div className="card-body">
              <div className="info-item">
                <FaBuilding className="info-icon" />
                <span>{emp.departmentDTO?.name || "No Department"}</span>
              </div>
              <div className="info-item">
                <FaVenusMars className="info-icon" />
                <span className="gender-info">
                  {getGenderIcon(emp.gender)}
                  {emp.gender || "Not specified"}
                </span>
              </div>
              <div className="info-item">
                <FaPhone className="info-icon" />
                <span>{emp.phoneNumber || "No phone"}</span>
              </div>
              {emp.bloodGroup && (
                <div className="info-item">
                  <FaTint className="info-icon" />
                  <span className="blood-group">{emp.bloodGroup}</span>
                </div>
              )}
              <div className="info-item">
                <span className={`status-badge ${emp.active ? 'active' : 'inactive'}`}>
                  {emp.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="card-actions">
              <button 
                className="action-btn view-btn" 
                onClick={() => handleViewEmployee(emp)}
                title="View Details"
              >
                <FaEye />
              </button>
              <button 
                className="action-btn edit-btn" 
                onClick={() => onEditEmployee(emp)}
                title="Edit Employee"
              >
                <FaEdit />
              </button>
              <button 
                className="action-btn delete-btn" 
                onClick={() => setConfirmDelete({ show: true, empId: emp.id, empName: emp.name })}
                title="Delete Employee"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="empty-state">
          <FaUser className="empty-icon" />
          <h3>No employees found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {isModalOpen && selectedEmployee && (
        <div className="modern-modal-overlay" onClick={closeModal}>
          <div className="employee-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Employee Details</h2>
              <button className="modal-close" onClick={closeModal}>
                <FaClose />
              </button>
            </div>
            
            <div className="details-content">
              <div className="details-header">
                <div className="details-avatar">
                  <FaUser />
                </div>
                <div className="details-title">
                  <h3>{selectedEmployee.name || "Unnamed Employee"}</h3>
                  <p className="employee-id">Employee ID: #{selectedEmployee.id}</p>
                  <span className={`details-status ${selectedEmployee.active ? 'active' : 'inactive'}`}>
                    {selectedEmployee.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <label>Email</label>
                  <p>{selectedEmployee.email || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label>Phone Number</label>
                  <p>{selectedEmployee.phoneNumber || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label>Gender</label>
                  <p className="gender-detail">
                    {getGenderIcon(selectedEmployee.gender)}
                    {selectedEmployee.gender ? selectedEmployee.gender.charAt(0).toUpperCase() + selectedEmployee.gender.slice(1) : "N/A"}
                  </p>
                </div>
                <div className="detail-item">
                  <label>Blood Group</label>
                  <p className="blood-group-detail">
                    {selectedEmployee.bloodGroup ? (
                      <>
                        <FaTint />
                        {selectedEmployee.bloodGroup}
                      </>
                    ) : "N/A"}
                  </p>
                </div>
                <div className="detail-item">
                  <label>Date of Birth</label>
                  <p>{formatDate(selectedEmployee.dateOfBirth)}</p>
                </div>
                <div className="detail-item">
                  <label>Age</label>
                  <p>{calculateAge(selectedEmployee.dateOfBirth)} years</p>
                </div>
                <div className="detail-item full-width">
                  <label>Department</label>
                  <p className="department-detail">
                    <FaBuilding />
                    {selectedEmployee.departmentDTO?.name || "No Department Assigned"}
                    {selectedEmployee.departmentDTO?.description && (
                      <span className="department-description">
                        - {selectedEmployee.departmentDTO.description}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-primary" onClick={closeModal}>
                Close
              </button>
              <button 
                className="edit-profile-btn"
                onClick={() => {
                  onEditEmployee(selectedEmployee);
                  closeModal();
                }}
              >
                <FaEdit />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete.show && (
        <div className="modern-modal-overlay" onClick={() => setConfirmDelete({ show: false, empId: null, empName: "" })}>
          <div className="delete-confirmation" onClick={(e) => e.stopPropagation()}>
            <div className="delete-header">
              <div className="warning-icon">
                <FaTrash />
              </div>
              <h3>Delete Employee</h3>
            </div>
            <div className="delete-content">
              <p>Are you sure you want to delete <strong>{confirmDelete.empName}</strong>?</p>
              <p className="warning-text">This action cannot be undone and will permanently remove the employee record.</p>
            </div>
            <div className="delete-actions">
              <button
                className="btn-cancel"
                onClick={() => setConfirmDelete({ show: false, empId: null, empName: "" })}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={async () => {
                  await deleteEmployee(confirmDelete.empId);
                  setConfirmDelete({ show: false, empId: null, empName: "" });
                }}
              >
                Delete Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeList;