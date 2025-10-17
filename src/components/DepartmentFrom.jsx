import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBuilding, FaSave, FaSync, FaEdit, FaInfoCircle, FaTimes } from "react-icons/fa";

function DepartmentForm({ onDepartmentAdded, editingDepartment }) {
  const [department, setDepartment] = useState({
    name: "",
    description: "",
  });
  
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // FIXED: Proper authentication headers
  const getAuthConfig = () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.warn('No user data found in localStorage');
        return { headers: {} };
      }
      
      const user = JSON.parse(userData);
      return {
        headers: {
          'X-Username': user.username || '',
          'X-Role': user.role || 'USER'
        }
      };
    } catch (error) {
      console.error('Error getting auth config:', error);
      return { headers: {} };
    }
  };

  useEffect(() => {
    console.log("Editing department changed:", editingDepartment);
    if (editingDepartment) {
      setDepartment({
        name: editingDepartment.name || "",
        description: editingDepartment.description || "",
      });
    } else {
      setDepartment({ name: "", description: "" });
    }
  }, [editingDepartment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartment(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleCancelEdit = () => {
    setDepartment({ name: "", description: "" });
    if (onDepartmentAdded) {
      onDepartmentAdded();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting department:", department);
    console.log("Editing mode:", !!editingDepartment);
    
    if (!department.name.trim()) {
      setModalMessage("Please enter a department name");
      setIsModalOpen(true);
      return;
    }

    setIsLoading(true);
    
    try {
      const config = getAuthConfig();
      let response;
      
      if (editingDepartment && editingDepartment.id) {
        console.log("Updating department with ID:", editingDepartment.id);
        response = await axios.put(`http://localhost:8080/departments/${editingDepartment.id}`, department, config);
        setModalMessage("Department updated successfully!");
      } else {
        console.log("Creating new department");
        response = await axios.post("http://localhost:8080/departments", department, config);
        setModalMessage("Department added successfully!");
      }
      
      console.log("API Response:", response);
      setIsModalOpen(true);
      
      setDepartment({ name: "", description: "" });
      
      if (onDepartmentAdded) {
        console.log("Calling onDepartmentAdded callback");
        onDepartmentAdded();
      } else {
        console.warn("onDepartmentAdded callback is not provided");
      }
      
    } catch (err) {
      console.error("Error saving department:", err);
      let errorMessage = "Error saving department";
      
      if (err.response?.status === 403) {
        errorMessage = "Access denied: You don't have permission to manage departments.";
      } else if (err.response) {
        errorMessage = `Error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`;
      } else if (err.request) {
        errorMessage = "No response from server. Please check if the server is running.";
      } else {
        errorMessage = `Error: ${err.message}`;
      }
      
      setModalMessage(errorMessage);
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="modern-form">
        <div className="form-header">
          <h2>
            {editingDepartment ? (
              <>📝 Edit Department</>
            ) : (
              <>Add New Department</>
            )}
          </h2>
          <div className="form-icon">
            <FaBuilding />
          </div>
        </div>

        {editingDepartment && (
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <strong>Editing Mode:</strong> You are editing "<strong>{editingDepartment.name}</strong>"
            </div>
            <button
              type="button"
              onClick={handleCancelEdit}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }}
            >
              <FaTimes /> Cancel
            </button>
          </div>
        )}

        <div className="form-grid">
          <div className="form-group full-width">
            <label className="input-label">
              <FaBuilding className="input-icon" />
              Department Name *
            </label>
            <input
              type="text"
              name="name"
              value={department.name}
              placeholder="Enter department name (required)"
              onChange={handleChange}
              className="modern-input"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group full-width">
            <label className="input-label">
              <FaInfoCircle className="input-icon" />
              Description
            </label>
            <textarea
              name="description"
              value={department.description}
              placeholder="Enter department description (optional)"
              onChange={handleChange}
              className="modern-textarea"
              rows="3"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-actions-right">
          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading || !department.name.trim()}
          >
            {isLoading ? (
              <>
                <FaSync className="spin" />
                {editingDepartment ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>
                {editingDepartment ? <FaEdit /> : <FaSave />}
                {editingDepartment ? "Update Department" : "Add Department"}
              </>
            )}
          </button>
        </div>
      </form>

      {isModalOpen && (
        <div className="modern-modal-overlay">
          <div className="modern-modal">
            <div className="modal-header">
              <h3>{modalMessage.includes("Error") ? "Error" : "Success"}</h3>
              <button 
                className="modal-close" 
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className={`modal-icon ${modalMessage.includes("Error") ? "error" : "success"}`}>
                {modalMessage.includes("Error") ? "⚠️" : "✓"}
              </div>
              <p>{modalMessage}</p>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-btn" 
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DepartmentForm;