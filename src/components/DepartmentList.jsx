import React, { useState } from "react";
import axios from "axios";
import { FaTrash, FaEye, FaEdit, FaTimes } from "react-icons/fa";


function DepartmentList({ departments, onDepartmentDeleted, onEditDepartment, }) {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const deleteDepartment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) {
      return;
    }
    
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
    <div className="list">
      <h2>Departments</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept) => (
            <tr key={dept.id}>
              <td>{dept.id}</td>
              <td>{dept.name}</td>
              <td>
                <button
                  className="action-button update-btn"
                  onClick={() => onEditDepartment(dept)}
                  title="Edit"
                >
                  <FaEdit size={18} />
                </button>
                <button
                  className="action-button view-btn"
                  onClick={() => handleViewDepartment(dept)}
                  title="View"
                >
                  <FaEye size={18} />
                </button>
                <button
                  className="action-button delete-btn"
                  onClick={() => deleteDepartment(dept.id)}
                  title="Delete"
                >
                  <FaTrash size={18}/>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Popup */}
      {isModalOpen && selectedDepartment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Department Details</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">ID:</span>
                <span className="detail-value">{selectedDepartment.id}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedDepartment.name}</span>
              </div>
              
              {/* You can add more department details here if available */}
              {selectedDepartment.description && (
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{selectedDepartment.description}</span>
                </div>
              )}
              
              {selectedDepartment.createdDate && (
                <div className="detail-row">
                  <span className="detail-label">Created Date:</span>
                  <span className="detail-value">{selectedDepartment.createdDate}</span>
                </div>
              )}
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
          max-width: 450px;
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
          padding: 12px 0;
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

export default DepartmentList;