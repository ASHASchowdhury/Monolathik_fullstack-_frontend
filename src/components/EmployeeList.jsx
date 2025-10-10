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
  // State variables for managing component data
  const [confirmDelete, setConfirmDelete] = useState({ show: false, empId: null, empName: "" });
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Currently selected employee for viewing
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls modal visibility
  const [searchTerm, setSearchTerm] = useState(""); // Search input value
  const [statusFilter, setStatusFilter] = useState("all"); // Filter for active/inactive employees

  // Filter employees based on search and status
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && emp.active) ||
                         (statusFilter === "inactive" && !emp.active);
    return matchesSearch && matchesStatus;
  });

  // Delete employee from database
  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`http://10.0.6.1:8080/employees/${id}`);
      onEmployeeDeleted(); // Refresh employee list
    } catch (err) {
      console.error("Error deleting employee:", err);
    }
  };

  // Return appropriate gender icon
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

  // Open modal with employee details
  const handleViewEmployee = (emp) => {
    setSelectedEmployee(emp);
    setIsModalOpen(true);
  };

  // Close modal and reset selection
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  // Calculate age from date of birth
  const calculateAge = (dateString) => {
    if (!dateString) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="modern-employee-list">
      {/* Header with title and filters */}
      <div className="list-header">
        <div className="header-content">
          <div className="header-title">
            <h2>Employee Management</h2>
            <span className="employee-count">{filteredEmployees.length} of {employees.length} employees</span>
          </div>
          <div className="header-actions">
            {/* Search input */}
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
            {/* Status filter dropdown */}
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
          </div>
        </div>
      </div>

      {/* Grid of employee cards */}
      <div className="employee-grid">
        {filteredEmployees.map((emp) => (
          <div key={emp.id} className="modern-employee-card">
            {/* Card header with basic info */}
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

            {/* Card body with employee details */}
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

            {/* Action buttons */}
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

      {/* Show empty state when no employees found */}
      {filteredEmployees.length === 0 && (
        <div className="empty-state">
          <FaUser className="empty-icon" />
          <h3>No employees found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Employee Details Modal - Shows when isModalOpen is true */}
      {isModalOpen && selectedEmployee && (
        <div className="modern-modal-overlay">
          <div className="employee-details-modal">
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

              {/* Detailed employee information grid */}
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
                  </p>
                </div>
              </div>
            </div>

            {/* Modal footer with action buttons */}
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

      {/* Delete Confirmation Modal - Shows when confirmDelete.show is true */}
      {confirmDelete.show && (
        <div className="modern-modal-overlay">
          <div className="delete-confirmation">
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