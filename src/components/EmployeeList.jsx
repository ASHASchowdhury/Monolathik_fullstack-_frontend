import React, { useState } from "react";
import axios from "axios";
import { FaTrash, FaEye, FaEdit, FaTimes } from "react-icons/fa";

function EmployeeList({ employees, onEmployeeDeleted, onEditEmployee, onViewEmployee }) {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, empId: null });

  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`http://10.0.6.1:8080/employees/${id}`);
      onEmployeeDeleted();
    } catch (err) {
      console.error("Error deleting employee:", err);
      alert("Error deleting employee");
    }
  };

  const handleViewEmployee = (emp) => {
    setSelectedEmployee(emp);
    setIsModalOpen(true);
    if (onViewEmployee) onViewEmployee(emp);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="list">
      <h2>Employees</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Gender</th>
            <th>Active</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.phoneNumber}</td>
              <td>{emp.gender}</td>
              <td>{emp.active ? "Yes" : "No"}</td>
              <td>{emp.departmentDTO?.name || "N/A"}</td>
              <td>
                <button className="action-button update-btn" onClick={() => onEditEmployee(emp)} title="Edit">
                  <FaEdit size={18} />
                </button>
                <button className="action-button view-btn" onClick={() => handleViewEmployee(emp)} title="View">
                  <FaEye size={18} />
                </button>
                <button className="action-button delete-btn" onClick={() => setConfirmDelete({ show: true, empId: emp.id })} title="Delete">
                  <FaTrash size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* View Modal */}
      {isModalOpen && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Employee Details</h3>
              <button className="modal-close-btn" onClick={closeModal}><FaTimes size={20} /></button>
            </div>
            <div className="modal-body">
              {["id","name","email","phoneNumber","gender","active"].map((key) => (
                <div className="detail-row" key={key}>
                  <span className="detail-label">{key === "active" ? "Active" : key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                  <span className="detail-value">{key === "active" ? (selectedEmployee[key] ? "Yes" : "No") : selectedEmployee[key]}</span>
                </div>
              ))}
              <div className="detail-row">
                <span className="detail-label">Department:</span>
                <span className="detail-value">{selectedEmployee.departmentDTO?.name || "N/A"}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-ok-btn" onClick={closeModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button className="modal-close-btn" onClick={() => setConfirmDelete({ show: false, empId: null })}>
                <FaTimes size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this employee?</p>
            </div>
            <div className="modal-footer">
              <button className="modal-ok-btn danger" onClick={async () => { await deleteEmployee(confirmDelete.empId); setConfirmDelete({ show: false, empId: null }); }}>
                Yes, Delete
              </button>
              <button className="modal-ok-btn secondary" onClick={() => setConfirmDelete({ show: false, empId: null })}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        .modal-ok-btn {
          padding: 8px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          color: white;
        }
        .modal-ok-btn.danger { background-color: #ef4444; }
        .modal-ok-btn.danger:hover { background-color: #dc2626; }
        .modal-ok-btn.secondary { background-color: #6b7280; }
        .modal-ok-btn.secondary:hover { background-color: #4b5563; }
      `}</style>
    </div>
  );
}

export default EmployeeList;
