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
  // ===== STATE MANAGEMENT =====
  
  // State for delete confirmation dialog
  const [confirmDelete, setConfirmDelete] = useState({ 
    show: false,      // Controls visibility of delete confirmation
    empId: null,      // ID of employee to be deleted
    empName: ""       // Name of employee for confirmation message
  });
  
  // State for employee details modal
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Currently selected employee for viewing
  const [isModalOpen, setIsModalOpen] = useState(false);         // Controls visibility of details modal
  
  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState("");              // Current search input value
  const [statusFilter, setStatusFilter] = useState("all");       // Current status filter ("all", "active", "inactive")

  // ===== AUTHENTICATION CONFIGURATION =====
  
  /**
   * Creates authentication configuration for API requests
   * Retrieves user credentials from localStorage and constructs headers
   * @returns {Object} Axios configuration object with headers
   */
  const getAuthConfig = () => {
    try {
      // Retrieve individual authentication fields from browser's localStorage
      const username = localStorage.getItem('username');  // Current user's username
      const role = localStorage.getItem('userRole');      // Current user's role (admin, manager, etc.)
      const token = localStorage.getItem('authToken');    // JWT token if using token-based auth
      
      // Debug logging to help with authentication issues
      console.log('Auth headers - Username:', username, 'Role:', role);
      
      // Validate that required authentication fields exist
      if (!username || !role) {
        console.warn('Missing auth headers: username or role not found in localStorage');
        console.log('Available localStorage items:', Object.keys(localStorage));
        return { headers: {} }; // Return empty headers if auth data missing
      }
      
      // Construct headers object with authentication information
      const headers = {
        'X-Username': username,  // Custom header for username
        'X-Role': role           // Custom header for user role
      };
      
      // Add Authorization header if JWT token exists (for token-based authentication)
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      return { headers };
    } catch (error) {
      // Handle any errors that occur during auth configuration
      console.error('Error getting auth config:', error);
      return { headers: {} }; // Fallback to empty headers on error
    }
  };

  // ===== EMPLOYEE FILTERING LOGIC =====
  
  /**
   * Filters employees based on search term and status filter
   * Applies both search and filter conditions to the employee list
   */
  const filteredEmployees = employees.filter(emp => {
    // Search condition: matches name, email, or department name (case-insensitive)
    const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.departmentDTO?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter condition: matches active/inactive status or shows all
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && emp.active) ||
                         (statusFilter === "inactive" && !emp.active);
    
    // Return employees that match both search and filter conditions
    return matchesSearch && matchesStatus;
  });

  // ===== EMPLOYEE OPERATIONS =====
  
  /**
   * Deletes an employee by ID from the server
   * @param {number} id - The ID of the employee to delete
   */
  const deleteEmployee = async (id) => {
    try {
      // Log deletion attempt for debugging
      console.log('Attempting to delete employee ID:', id);
      
      // Get authentication configuration
      const config = getAuthConfig();
      console.log('Request config:', config);
      
      // Send DELETE request to the server
      const response = await axios.delete(`http://localhost:8080/employees/${id}`, config);
      console.log('Delete response:', response);
      
      // Check if deletion was successful (HTTP 200)
      if (response.status === 200) {
        // Notify parent component to refresh the employee list
        onEmployeeDeleted();
        // Show success message to user
        alert('Employee deleted successfully');
      }
    } catch (err) {
      // Handle different types of errors that may occur during deletion
      console.error("Error deleting employee:", err);
      console.log('Full error response:', err.response);
      console.log('Error data:', err.response?.data);
      console.log('Error message:', err.response?.data?.message);
      
      // Specific error handling based on HTTP status codes
      if (err.response?.status === 403) {
        alert("Access denied: You don't have permission to delete employees.");
      } else if (err.response?.status === 500) {
        // Extract error message from server response or use default
        const errorMessage = err.response?.data?.message || err.response?.data || "Internal server error";
        alert("Server error: " + errorMessage);
      } else {
        // Generic error handling for other types of errors
        alert("Error deleting employee: " + (err.response?.data?.message || err.message));
      }
    }
  };

  /**
   * Opens the employee details modal for a specific employee
   * @param {Object} emp - The employee object to display
   */
  const handleViewEmployee = (emp) => {
    setSelectedEmployee(emp);    // Set the employee to display
    setIsModalOpen(true);        // Show the modal
  };

  /**
   * Closes the employee details modal and resets selected employee
   */
  const closeModal = () => {
    setIsModalOpen(false);       // Hide the modal
    setSelectedEmployee(null);   // Clear the selected employee
  };

  // ===== UI HELPER FUNCTIONS =====
  
  /**
   * Returns appropriate gender icon based on gender value
   * @param {string} gender - The gender value ("male", "female", etc.)
   * @returns {JSX.Element} React icon component
   */
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

  /**
   * Calculates age from date of birth
   * @param {string} dateString - Date of birth in string format
   * @returns {number|string} Calculated age or 'N/A' if invalid
   */
  const calculateAge = (dateString) => {
    if (!dateString) return 'N/A'; // Return 'N/A' if no date provided
    
    try {
      const today = new Date();                    // Current date
      const birthDate = new Date(dateString);      // Convert string to Date object
      let age = today.getFullYear() - birthDate.getFullYear(); // Calculate base age
      
      // Adjust age if birthday hasn't occurred this year yet
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return 'N/A'; // Return 'N/A' if date parsing fails
    }
  };

  /**
   * Formats a date string to human-readable format
   * @param {string} dateString - Date string to format
   * @returns {string} Formatted date or error message
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'; // Return 'N/A' if no date provided
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',   // Full month name
        day: 'numeric'   // Day of month
      });
    } catch {
      return 'Invalid Date'; // Return error message if date parsing fails
    }
  };

  // ===== COMPONENT RENDER =====
  
  return (
    <div className="modern-employee-list">
      {/* ===== HEADER SECTION ===== */}
      <div className="list-header">
        <div className="header-content">
          {/* Title and employee count */}
          <div className="header-title">
            <h2>Employee Directory</h2>
            <span className="employee-count">
              {filteredEmployees.length} of {employees.length} employees
            </span>
          </div>
          
          {/* Search and filter controls */}
          <div className="header-actions">
            {/* Search input with icon */}
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // Update search term on input change
                className="search-input"
              />
            </div>
            
            {/* Status filter dropdown */}
            <div className="filter-group">
              <FaFilter className="filter-icon" />
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} // Update filter on selection change
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

      {/* ===== EMPLOYEE GRID ===== */}
      <div className="employee-grid">
        {/* Map through filtered employees and render cards */}
        {filteredEmployees.map((emp) => (
          <div key={emp.id} className={`modern-employee-card ${!emp.active ? 'inactive-employee' : ''}`}>
            
            {/* Card Header: Avatar, Name, ID, and Status */}
            <div className="card-header">
              <div className="employee-avatar">
                <FaUser /> {/* Default user avatar icon */}
              </div>
              <div className="employee-info">
                <h3>{emp.name || "Unnamed Employee"}</h3> {/* Fallback for missing names */}
                <span className="employee-id">#{emp.id}</span> {/* Employee ID badge */}
              </div>
              <div className={`status-indicator ${emp.active ? 'active' : 'inactive'}`}>
                {emp.active ? <FaCheck /> : <FaTimes />} {/* Checkmark for active, X for inactive */}
              </div>
            </div>

            {/* Card Body: Employee Information */}
            <div className="card-body">
              {/* Department Information */}
              <div className="info-item">
                <FaBuilding className="info-icon" />
                <span>{emp.departmentDTO?.name || "No Department"}</span> {/* Fallback for missing department */}
              </div>
              
              {/* Gender Information with Icon */}
              <div className="info-item">
                <FaVenusMars className="info-icon" />
                <span className="gender-info">
                  {getGenderIcon(emp.gender)} {/* Dynamic gender icon */}
                  {emp.gender || "Not specified"} {/* Gender text with fallback */}
                </span>
              </div>
              
              {/* Phone Number */}
              <div className="info-item">
                <FaPhone className="info-icon" />
                <span>{emp.phoneNumber || "No phone"}</span> {/* Fallback for missing phone */}
              </div>
              
              {/* Blood Group (Conditional - only show if exists) */}
              {emp.bloodGroup && (
                <div className="info-item">
                  <FaTint className="info-icon" />
                  <span className="blood-group">{emp.bloodGroup}</span>
                </div>
              )}
              
              {/* Status Badge */}
              <div className="info-item">
                <span className={`status-badge ${emp.active ? 'active' : 'inactive'}`}>
                  {emp.active ? "Active" : "Inactive"} {/* Text status indicator */}
                </span>
              </div>
            </div>

            {/* Card Actions: View, Edit, Delete Buttons */}
            <div className="card-actions">
              {/* View Details Button */}
              <button 
                className="action-btn view-btn" 
                onClick={() => handleViewEmployee(emp)} // Open details modal
                title="View Details"
              >
                <FaEye />
              </button>
              
              {/* Edit Employee Button */}
              <button 
                className="action-btn edit-btn" 
                onClick={() => onEditEmployee(emp)} // Trigger edit in parent component
                title="Edit Employee"
              >
                <FaEdit />
              </button>
              
              {/* Delete Employee Button */}
              <button 
                className="action-btn delete-btn" 
                onClick={() => setConfirmDelete({ 
                  show: true, 
                  empId: emp.id, 
                  empName: emp.name 
                })} // Show delete confirmation
                title="Delete Employee"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== EMPTY STATE ===== */}
      {/* Show when no employees match search/filter criteria */}
      {filteredEmployees.length === 0 && (
        <div className="empty-state">
          <FaUser className="empty-icon" />
          <h3>No employees found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* ===== EMPLOYEE DETAILS MODAL ===== */}
      {/* Modal that shows when viewing employee details */}
      {isModalOpen && selectedEmployee && (
        <div className="modern-modal-overlay" onClick={closeModal}>
          {/* Modal content - stop propagation to prevent closing when clicking inside */}
          <div className="employee-details-modal" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header with Close Button */}
            <div className="modal-header">
              <h2>Employee Details</h2>
              <button className="modal-close" onClick={closeModal}>
                <FaClose />
              </button>
            </div>
            
            {/* Modal Content Area */}
            <div className="details-content">
              {/* Employee Header Section */}
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

              {/* Detailed Information Grid */}
              <div className="details-grid">
                {/* Email */}
                <div className="detail-item">
                  <label>Email</label>
                  <p>{selectedEmployee.email || "N/A"}</p>
                </div>
                
                {/* Phone Number */}
                <div className="detail-item">
                  <label>Phone Number</label>
                  <p>{selectedEmployee.phoneNumber || "N/A"}</p>
                </div>
                
                {/* Gender with Icon */}
                <div className="detail-item">
                  <label>Gender</label>
                  <p className="gender-detail">
                    {getGenderIcon(selectedEmployee.gender)}
                    {selectedEmployee.gender ? 
                      selectedEmployee.gender.charAt(0).toUpperCase() + selectedEmployee.gender.slice(1) : 
                      "N/A"}
                  </p>
                </div>
                
                {/* Blood Group with Icon */}
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
                
                {/* Date of Birth (Formatted) */}
                <div className="detail-item">
                  <label>Date of Birth</label>
                  <p>{formatDate(selectedEmployee.dateOfBirth)}</p>
                </div>
                
                {/* Calculated Age */}
                <div className="detail-item">
                  <label>Age</label>
                  <p>{calculateAge(selectedEmployee.dateOfBirth)} years</p>
                </div>
                
                {/* Department Information (Full Width) */}
                <div className="detail-item full-width">
                  <label>Department</label>
                  <p className="department-detail">
                    <FaBuilding />
                    {selectedEmployee.departmentDTO?.name || "No Department Assigned"}
                    {/* Show department description if available */}
                    {selectedEmployee.departmentDTO?.description && (
                      <span className="department-description">
                        - {selectedEmployee.departmentDTO.description}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer with Action Buttons */}
            <div className="modal-footer">
              <button className="btn-primary" onClick={closeModal}>
                Close
              </button>
              <button 
                className="edit-profile-btn"
                onClick={() => {
                  onEditEmployee(selectedEmployee); // Trigger edit
                  closeModal(); // Close modal
                }}
              >
                <FaEdit />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {/* Modal that shows when confirming employee deletion */}
      {confirmDelete.show && (
        <div className="modern-modal-overlay" onClick={() => setConfirmDelete({ show: false, empId: null, empName: "" })}>
          {/* Confirmation dialog content */}
          <div className="delete-confirmation" onClick={(e) => e.stopPropagation()}>
            
            {/* Confirmation Header with Warning Icon */}
            <div className="delete-header">
              <div className="warning-icon">
                <FaTrash />
              </div>
              <h3>Delete Employee</h3>
            </div>
            
            {/* Confirmation Message */}
            <div className="delete-content">
              <p>Are you sure you want to delete <strong>{confirmDelete.empName}</strong>?</p>
              <p className="warning-text">This action cannot be undone and will permanently remove the employee record.</p>
            </div>
            
            {/* Confirmation Action Buttons */}
            <div className="delete-actions">
              {/* Cancel Button - Dismisses the confirmation */}
              <button
                className="btn-cancel"
                onClick={() => setConfirmDelete({ show: false, empId: null, empName: "" })}
              >
                Cancel
              </button>
              
              {/* Confirm Delete Button - Executes deletion */}
              <button
                className="btn-confirm"
                onClick={async () => {
                  await deleteEmployee(confirmDelete.empId); // Perform deletion
                  setConfirmDelete({ show: false, empId: null, empName: "" }); // Close confirmation
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