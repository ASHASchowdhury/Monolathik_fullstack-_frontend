import React, { useState } from "react";
import axios from "axios";
import { FaTrash, FaEye, FaEdit, FaTimes } from "react-icons/fa";

function EmployeeList({ employees, onEmployeeDeleted, onEditEmployee, onViewEmployee }) {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const deleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(`http://10.0.6.1:8080/employees/${id}`);
        onEmployeeDeleted();
      } catch (err) {
        console.error("Error deleting employee:", err);
        alert("Error deleting employee");
      }
    }
  };

  const handleViewEmployee = (emp) => {
    setSelectedEmployee(emp);
    setIsModalOpen(true);
    if (onViewEmployee) {
      onViewEmployee(emp);
    }
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

              {/* Actions column */}
              <td>
                <button
                  className="action-button update-btn"
                  onClick={() => onEditEmployee(emp)}
                  title="Edit"
                >
                  <FaEdit size={18} />
                </button>
                
                <button
                  className="action-button view-btn"
                  onClick={() => handleViewEmployee(emp)}
                  title="View"
                >
                  <FaEye size={18} />
                </button>
                
                <button
                  className="action-button delete-btn"
                  onClick={() => deleteEmployee(emp.id)}
                  title="Delete"
                >
                  <FaTrash size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Popup */}
      {isModalOpen && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Employee Details</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">ID:</span>
                <span className="detail-value">{selectedEmployee.id}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedEmployee.name}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedEmployee.email}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Phone Number:</span>
                <span className="detail-value">{selectedEmployee.phoneNumber}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Gender:</span>
                <span className="detail-value">{selectedEmployee.gender}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Active:</span>
                <span className="detail-value">{selectedEmployee.active ? "Yes" : "No"}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Department:</span>
                <span className="detail-value">{selectedEmployee.departmentDTO?.name || "N/A"}</span>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="modal-ok-btn" onClick={closeModal}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Modal Overlay */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        /* Modal Content */
        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          animation: modalAppear 0.3s ease-out;
        }

        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Modal Header */
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
          background-color: #f8f9fa;
          border-radius: 8px 8px 0 0;
        }

        .modal-header h3 {
          margin: 0;
          color: #333;
        }

        .modal-close-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #666;
          padding: 5px;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close-btn:hover {
          background-color: #e9ecef;
          color: #333;
        }

        /* Modal Body */
        .modal-body {
          padding: 20px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-weight: bold;
          color: #555;
          min-width: 120px;
        }

        .detail-value {
          color: #333;
          text-align: right;
          flex: 1;
        }

        /* Modal Footer */
        .modal-footer {
          padding: 15px 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          background-color: #f8f9fa;
          border-radius: 0 0 8px 8px;
        }

        .modal-ok-btn {
          padding: 8px 20px;
          background-color: #6366f1;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .modal-ok-btn:hover {
          background-color: #3e13b4;
        }

        /* Responsive Design */
        @media (max-width: 600px) {
          .modal-content {
            width: 95%;
            margin: 10px;
          }
          
          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }
          
          .detail-value {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
}

export default EmployeeList;