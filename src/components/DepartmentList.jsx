import React, { useState } from "react";
import axios from "axios";
import { FaTrash, FaEye, FaEdit, FaTimes, FaUsers, FaCalendar, FaUser, FaIdCard } from "react-icons/fa";
import "./DepartmentList.css";

function DepartmentList({ departments, onDepartmentDeleted, onEditDepartment }) {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, deptId: null });

  // Function to delete department from API - FIXED
  const deleteDepartment = async (id) => {
    try {
      await axios.delete(`http://10.0.6.1:8080/departments/${id}`);
      onDepartmentDeleted(); // Refresh the list
    } catch (err) {
      console.error("Error deleting department:", err);
      alert("Error deleting department: " + (err.response?.data?.message || err.message));
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
      <div className="list-header">
        <h2>Department Management</h2>
        <span className="department-count">{departments.length} departments</span>
      </div>
      
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
            {departments.map((dept) => (
              <tr key={dept.id} className="table-row">
                {/* FIXED: Use dept.id consistently */}
                <td className="dept-id">
                  <FaIdCard className="icon-sm" />
                  {dept.id} {/* Changed from dept.deptId || dept.id */}
                </td>
                
                <td className="dept-name">{dept.name}</td>
                
                <td className="employee-count">
                  <FaUsers className="icon-sm" />
                  {dept.employeeNames?.length || 0} employees
                </td>
                
                <td className="action-buttons">
                  <div className="action-buttons-container">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEditDepartment(dept)}
                      title="Edit Department"
                    >
                      <FaEdit />
                    </button>
                    
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleViewDepartment(dept)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    
                    {/* FIXED: Use dept.id for deletion */}
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

      {/* Department Details Modal - FIXED ID display */}
      {isModalOpen && selectedDepartment && (
        <div className="modal-overlay">
          <div className="modal-content modern-modal">
            <div className="modal-header">
              <div className="modal-title">
                <h3>Department Details</h3>
                <span className="dept-badge">{selectedDepartment.name}</span>
              </div>
              <button className="modal-close-btn" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="details-grid">
                {/* FIXED: Use selectedDepartment.id consistently */}
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaIdCard />
                  </div>
                  <div className="detail-content">
                    <label>Department ID</label>
                    <span>{selectedDepartment.id}</span> {/* Changed from deptId || id */}
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <FaUser />
                  </div>
                  <div className="detail-content">
                    <label>Department Name</label>
                    <span>{selectedDepartment.name}</span>
                  </div>
                </div>

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

                <div className="detail-item">
                  <div className="detail-icon">
                    <FaUser />
                  </div>
                  <div className="detail-content">
                    <label>Created By</label>
                    <span>{selectedDepartment.createdBy || "Admin"}</span>
                  </div>
                </div>

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

                <div className="detail-item full-width">
                  <div className="detail-icon">
                    <FaUsers />
                  </div>
                  <div className="detail-content">
                    <label>Employees ({selectedDepartment.employeeNames?.length || 0})</label>
                    <div className="employees-list">
                      {selectedDepartment.employeeNames && selectedDepartment.employeeNames.length > 0 ? (
                        selectedDepartment.employeeNames.map((employee, index) => (
                          <span key={index} className="employee-tag">
                            {employee}
                          </span>
                        ))
                      ) : (
                        <span className="no-employees">No employees assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-primary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - No changes needed here */}
      {confirmDelete.show && (
        <div className="modal-overlay">
          <div className="modal-content modern-modal delete-modal">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button
                className="modal-close-btn"
                onClick={() => setConfirmDelete({ show: false, deptId: null })}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="warning-icon">
                <FaTrash />
              </div>
              <p>Are you sure you want to delete this department?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>

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