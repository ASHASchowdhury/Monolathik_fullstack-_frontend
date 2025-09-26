import React, { useState } from "react";
import axios from "axios";
import { FaTrash, FaEye, FaEdit, FaTimes, FaUsers, FaCalendar, FaUser, FaIdCard } from "react-icons/fa";

function DepartmentList({ departments, onDepartmentDeleted, onEditDepartment }) {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, deptId: null });

  const deleteDepartment = async (id) => {
    try {
      await axios.delete(`http://10.0.6.1:8080/departments/${id}`);
      onDepartmentDeleted(); // refresh after delete
    } catch (err) {
      console.error("Error deleting department:", err);
      alert("Error deleting department");
    }
  };

  const handleViewDepartment = (dept) => {
    setSelectedDepartment(dept);
    setIsModalOpen(true);
  };

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
                <td className="dept-id">
                  <FaIdCard className="icon-sm" />
                  {dept.deptId || dept.id}
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

      {/* Department Details Modal */}
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
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaIdCard />
                  </div>
                  <div className="detail-content">
                    <label>Department ID</label>
                    <span>{selectedDepartment.deptId || selectedDepartment.id}</span>
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

      {/* Delete Confirmation Modal */}
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

      <style jsx>{`
        .department-list {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .list-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .department-count {
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .table-container {
          overflow-x: auto;
          padding: 0;
        }

        .modern-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        .modern-table th {
          background: #f8fafc;
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          color: #64748b;
          border-bottom: 2px solid #e2e8f0;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .actions-header {
          width: 150px;
          min-width: 150px;
        }

        .table-row {
          border-bottom: 1px solid #f1f5f9;
          transition: all 0.2s ease;
        }

        .table-row:hover {
          background: #f8fafc;
        }

        .modern-table td {
          padding: 16px 12px;
          color: #475569;
          vertical-align: middle;
          white-space: nowrap;
        }

        .dept-id, .employee-count {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          min-width: 120px;
        }

        .dept-name {
          font-weight: 600;
          color: #1e293b;
          min-width: 150px;
        }

        .employee-count {
          min-width: 140px;
        }

        .icon-sm {
          color: #94a3b8;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .action-buttons {
          width: 150px;
          min-width: 150px;
          max-width: 150px;
        }

        .action-buttons-container {
          display: flex;
          gap: 8px;
          justify-content: flex-start;
          align-items: center;
          width: 100%;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 36px;
          height: 36px;
          flex-shrink: 0;
        }

        .edit-btn {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .edit-btn:hover {
          background: #bfdbfe;
          transform: translateY(-1px);
        }

        .view-btn {
          background: #dcfce7;
          color: #166534;
        }

        .view-btn:hover {
          background: #bbf7d0;
          transform: translateY(-1px);
        }

        .delete-btn {
          background: #fee2e2;
          color: #dc2626;
        }

        .delete-btn:hover {
          background: #fecaca;
          transform: translateY(-1px);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modern-modal {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .modal-title h3 {
          margin: 0;
          color: #1e293b;
          font-size: 1.25rem;
        }

        .dept-badge {
          background: #6366f1;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .modal-close-btn {
          background: #f1f5f9;
          border: none;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .modal-close-btn:hover {
          background: #e2e8f0;
          color: #475569;
        }

        .modal-body {
          padding: 24px;
        }

        .details-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .detail-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
          border-left: 4px solid #6366f1;
        }

        .detail-item.full-width {
          grid-column: 1 / -1;
        }

        .detail-icon {
          color: #6366f1;
          font-size: 1.1rem;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .detail-content {
          flex: 1;
        }

        .detail-content label {
          display: block;
          font-size: 0.8rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .detail-content span {
          display: block;
          color: #1e293b;
          font-weight: 500;
        }

        .employees-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .employee-tag {
          background: #e0e7ff;
          color: #3730a3;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .no-employees {
          color: #94a3b8;
          font-style: italic;
        }

        .modal-footer {
          padding: 20px 24px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .btn-primary, .btn-secondary, .btn-danger {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #6366f1;
          color: white;
        }

        .btn-primary:hover {
          background: #4f46e5;
        }

        .btn-secondary {
          background: #f1f5f9;
          color: #475569;
        }

        .btn-secondary:hover {
          background: #e2e8f0;
        }

        .btn-danger {
          background: #dc2626;
          color: white;
        }

        .btn-danger:hover {
          background: #b91c1c;
        }

        /* Delete Modal Specific Styles */
        .delete-modal .modal-body {
          text-align: center;
        }

        .warning-icon {
          width: 60px;
          height: 60px;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 1.5rem;
        }

        .warning-text {
          color: #dc2626;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .table-container {
            overflow-x: auto;
          }
          
          .modern-table {
            min-width: 700px;
          }
          
          .action-buttons {
            width: 120px;
            min-width: 120px;
          }
          
          .action-buttons-container {
            gap: 6px;
          }
          
          .action-btn {
            width: 32px;
            height: 32px;
            padding: 6px;
          }
        }

        @media (max-width: 480px) {
          .list-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .modal-content {
            margin: 20px;
            width: calc(100% - 40px);
          }
          
          .modern-table {
            min-width: 600px;
          }
        }
      `}</style>
    </div>
  );
}

export default DepartmentList;