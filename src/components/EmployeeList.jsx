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
  const [viewEmployee, setViewEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && emp.active) ||
                         (statusFilter === "inactive" && !emp.active);
    return matchesSearch && matchesStatus;
  });

  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`http://10.0.6.1:8080/employees/${id}`);
      onEmployeeDeleted();
    } catch (err) {
      console.error("Error deleting employee:", err);
    }
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

  const handleViewEmployee = (emp) => {
    setViewEmployee(emp);
  };

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
      <div className="list-header">
        <div className="header-content">
          <div className="header-title">
            <h2>Employee Management</h2>
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
          </div>
        </div>
      </div>

      <div className="employee-grid">
        {filteredEmployees.map((emp) => (
          <div key={emp.id} className="modern-employee-card">
            <div className="card-header">
              <div className="employee-avatar">
                <FaUser />
              </div>
              <div className="employee-info">
                <h3>{emp.name}</h3>
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

      {/* Employee Details View Modal */}
      {viewEmployee && (
        <div className="modern-modal-overlay">
          <div className="employee-details-modal">
            <div className="modal-header">
              <h2>Employee Details</h2>
              <button className="modal-close" onClick={() => setViewEmployee(null)}>
                <FaClose />
              </button>
            </div>
            
            <div className="details-content">
              <div className="details-header">
                <div className="details-avatar">
                  <FaUser />
                </div>
                <div className="details-title">
                  <h3>{viewEmployee.name}</h3>
                  <p className="employee-id">Employee ID: #{viewEmployee.id}</p>
                  <span className={`details-status ${viewEmployee.active ? 'active' : 'inactive'}`}>
                    {viewEmployee.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <label>Email</label>
                  <p>{viewEmployee.email || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label>Phone Number</label>
                  <p>{viewEmployee.phoneNumber || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label>Gender</label>
                  <p className="gender-detail">
                    {getGenderIcon(viewEmployee.gender)}
                    {viewEmployee.gender ? viewEmployee.gender.charAt(0).toUpperCase() + viewEmployee.gender.slice(1) : "N/A"}
                  </p>
                </div>
                <div className="detail-item">
                  <label>Blood Group</label>
                  <p className="blood-group-detail">
                    {viewEmployee.bloodGroup ? (
                      <>
                        <FaTint />
                        {viewEmployee.bloodGroup}
                      </>
                    ) : "N/A"}
                  </p>
                </div>
                <div className="detail-item">
                  <label>Date of Birth</label>
                  <p>{formatDate(viewEmployee.dateOfBirth)}</p>
                </div>
                <div className="detail-item">
                  <label>Age</label>
                  <p>{calculateAge(viewEmployee.dateOfBirth)} years</p>
                </div>
                <div className="detail-item full-width">
                  <label>Department</label>
                  <p className="department-detail">
                    <FaBuilding />
                    {viewEmployee.departmentDTO?.name || "No Department Assigned"}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="edit-profile-btn"
                onClick={() => {
                  onEditEmployee(viewEmployee);
                  setViewEmployee(null);
                }}
              >
                <FaEdit />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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