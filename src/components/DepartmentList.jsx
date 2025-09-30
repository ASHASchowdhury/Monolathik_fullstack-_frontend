import React, { useState } from "react";
import axios from "axios";
import { FaTrash, FaEye, FaEdit, FaTimes, FaUsers, FaCalendar, FaUser, FaIdCard } from "react-icons/fa";
import "./DepartmentList.css"; // Import CSS file

function DepartmentList({ departments, onDepartmentDeleted, onEditDepartment }) {
  // State for managing modals and selected department
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, deptId: null });

  // Function to delete department from API
  const deleteDepartment = async (id) => {
    try {
      await axios.delete(`http://10.0.6.1:8080/departments/${id}`);
      onDepartmentDeleted(); // Refresh the list
    } catch (err) {
      console.error("Error deleting department:", err);
      alert("Error deleting department");
    }
  };

  // Open department details modal
  const handleViewDepartment = (dept) => {
    setSelectedDepartment(dept);
    setIsModalOpen(true);
  };

  // Close all modals
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDepartment(null);
  };

  return (
    <div className="department-list">
      {/* Header with title and department count */}
      <div className="list-header">
        <h2>Department Management</h2>
        <span className="department-count">{departments.length} departments</span>
      </div>
      
      {/* Main table container */}
      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Department ID</th>
              <th>Name</th>
              <th>Employees</th>
              <th className="actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Map through departments and create table rows */}
            {departments.map((dept) => (
              <tr key={dept.id} className="table-row">
                {/* Department ID with icon */}
                <td className="dept-id">
                  <FaIdCard className="icon-sm" />
                  {dept.deptId || dept.id}
                </td>
                
                {/* Department name */}
                <td className="dept-name">{dept.name}</td>
                
                {/* Employee count with icon */}
                <td className="employee-count">
                  <FaUsers className="icon-sm" />
                  {dept.employeeNames?.length || 0} employees
                </td>
                
                {/* Action buttons */}
                <td className="action-buttons">
                  <div className="action-buttons-container">
                    {/* Edit button */}
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEditDepartment(dept)}
                      title="Edit Department"
                    >
                      <FaEdit />
                    </button>
                    
                    {/* View details button */}
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleViewDepartment(dept)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    
                    {/* Delete button */}
                    <button
                      className="action-btn delete-btn"
                      onClick={() => setConfirmDelete({ show: true, deptId: dept.id })}
                      title="Delete Department"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Department Details Modal - Shows when isModalOpen is true */}
      {isModalOpen && selectedDepartment && (
        <div className="modal-overlay">
          <div className="modal-content modern-modal">
            {/* Modal header with title and close button */}
            <div className="modal-header">
              <div className="modal-title">
                <h3>Department Details</h3>
                <span className="dept-badge">{selectedDepartment.name}</span>
              </div>
              <button className="modal-close-btn" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            {/* Modal body with department information */}
            <div className="modal-body">
              <div className="details-grid">
                {/* Department ID */}
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaIdCard />
                  </div>
                  <div className="detail-content">
                    <label>Department ID</label>
                    <span>{selectedDepartment.deptId || selectedDepartment.id}</span>
                  </div>
                </div>

                {/* Department Name */}
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaUser />
                  </div>
                  <div className="detail-content">
                    <label>Department Name</label>
                    <span>{selectedDepartment.name}</span>
                  </div>
                </div>

                {/* Department Description - Only shows if exists */}
                {selectedDepartment.description && (
                  <div className="detail-item full-width">
                    <div className="detail-icon">
                      <FaEdit />
                    </div>
                    <div className="detail-content">
                      <label>Description</label>
                      <span>{selectedDepartment.description}</span>
                    </div>
                  </div>
                )}

                {/* Created By */}
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaUser />
                  </div>
                  <div className="detail-content">
                    <label>Created By</label>
                    <span>{selectedDepartment.createdBy || "Admin"}</span>
                  </div>
                </div>

                {/* Created Date - Only shows if exists */}
                {selectedDepartment.createdDate && (
                  <div className="detail-item">
                    <div className="detail-icon">
                      <FaCalendar />
                    </div>
                    <div className="detail-content">
                      <label>Created Date</label>
                      <span>{selectedDepartment.createdDate}</span>
                    </div>
                  </div>
                )}

                {/* Employees List */}
                <div className="detail-item full-width">
                  <div className="detail-icon">
                    <FaUsers />
                  </div>
                  <div className="detail-content">
                    <label>Employees ({selectedDepartment.employeeNames?.length || 0})</label>
                    <div className="employees-list">
                      {/* Show employee names if they exist */}
                      {selectedDepartment.employeeNames && selectedDepartment.employeeNames.length > 0 ? (
                        selectedDepartment.employeeNames.map((employee, index) => (
                          <span key={index} className="employee-tag">
                            {employee}
                          </span>
                        ))
                      ) : (
                        /* Show message if no employees */
                        <span className="no-employees">No employees assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer with close button */}
            <div className="modal-footer">
              <button className="btn-primary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Shows when confirmDelete.show is true */}
      {confirmDelete.show && (
        <div className="modal-overlay">
          <div className="modal-content modern-modal delete-modal">
            {/* Delete modal header */}
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button
                className="modal-close-btn"
                onClick={() => setConfirmDelete({ show: false, deptId: null })}
              >
                <FaTimes />
              </button>
            </div>

            {/* Delete confirmation content */}
            <div className="modal-body">
              <div className="warning-icon">
                <FaTrash />
              </div>
              <p>Are you sure you want to delete this department?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>

            {/* Delete action buttons */}
            <div className="modal-footer">
              <button
                className="btn-danger"
                onClick={async () => {
                  await deleteDepartment(confirmDelete.deptId);
                  setConfirmDelete({ show: false, deptId: null });
                }}
              >
                Delete Department
              </button>
              <button
                className="btn-secondary"
                onClick={() => setConfirmDelete({ show: false, deptId: null })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartmentList;