import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaVenusMars, 
  FaBuilding, 
  FaCheck, 
  FaTimes,
  FaSave,
  FaSync,
  FaTint,
  FaCalendarAlt
} from "react-icons/fa";

const username = 'admin';
const password = 'admin123';

function EmployeeForm({ onEmployeeAdded, selectedEmployee, onUpdateComplete }) {
  const [employee, setEmployee] = useState({
    id: null,
    name: "",
    phoneNumber: "",
    email: "",
    gender: "",
    bloodGroup: "",
    dateOfBirth: "",
    active: true,
    departmentDTO: { id: "" },
  });

  const [departments, setDepartments] = useState([]);
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  useEffect(() => {
    axios
      .get("http://10.0.6.1:8080/departments", {
        auth: { username, password }
      })
      .then((res) => {
        setDepartments(res.data || []);
        setDepartmentsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading departments:", err);
        setDepartments([]);
        setDepartmentsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedEmployee && selectedEmployee.id) {
      try {
        const formattedEmployee = {
          ...selectedEmployee,
          dateOfBirth: selectedEmployee.dateOfBirth ? selectedEmployee.dateOfBirth.split('T')[0] : "",
          departmentDTO: selectedEmployee.departmentDTO || { id: "" }
        };
        setEmployee(formattedEmployee);
      } catch (error) {
        console.error("Error formatting employee:", error);
        resetForm();
      }
    } else {
      resetForm();
    }
  }, [selectedEmployee]);

  const resetForm = () => {
    setEmployee({
      id: null,
      name: "",
      phoneNumber: "",
      email: "",
      gender: "",
      bloodGroup: "",
      dateOfBirth: "",
      active: true,
      departmentDTO: { id: "" },
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    setEmployee(prev => ({
      ...prev,
      departmentDTO: { id: value ? Number(value) : "" }
    }));
  };

  const handleStatusChange = (isActive) => {
    setEmployee(prev => ({ ...prev, active: isActive }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (employee.id) {
        await axios.put(`http://10.0.6.1:8080/employees/${employee.id}`, employee, {
          auth: { username, password }
        });
        setModalMessage("Employee updated successfully!");
        setIsModalOpen(true);
        if (onUpdateComplete) {
          onUpdateComplete();
        }
      } else {
        await axios.post("http://10.0.6.1:8080/employees", employee, {
          auth: { username, password }
        });
        setModalMessage("Employee added successfully!");
        setIsModalOpen(true);
        if (onEmployeeAdded) {
          onEmployeeAdded();
        }
      }
      resetForm();
    } catch (err) {
      console.error("Error saving employee:", err);
      setModalMessage("Error saving employee: " + (err.response?.data?.message || err.message));
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (dateString) => {
    if (!dateString) return '';
    try {
      const today = new Date();
      const birthDate = new Date(dateString);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return '';
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="modern-form">
        <div className="form-header">
          <h2>{employee.id ? "Update Employee" : "Add New Employee"}</h2>
          <div className="form-icon">
            <FaUser />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group full-width">
            <label className="input-label">
              <FaUser className="input-icon" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={employee.name || ""}
              onChange={handleChange}
              className="modern-input"
              placeholder="Enter employee name"
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label">
              <FaPhone className="input-icon" />
              Phone Number
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={employee.phoneNumber || ""}
              onChange={handleChange}
              className="modern-input"
              placeholder="Enter phone number"
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label">
              <FaEnvelope className="input-icon" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={employee.email || ""}
              onChange={handleChange}
              className="modern-input"
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label">
              <FaVenusMars className="input-icon" />
              Gender
            </label>
            <select 
              name="gender" 
              value={employee.gender || ""} 
              onChange={handleChange} 
              className="modern-select"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="input-label">
              <FaTint className="input-icon" />
              Blood Group
            </label>
            <select 
              name="bloodGroup" 
              value={employee.bloodGroup || ""} 
              onChange={handleChange} 
              className="modern-select"
            >
              <option value="">Select Blood Group</option>
              {bloodGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="input-label">
              <FaCalendarAlt className="input-icon" />
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={employee.dateOfBirth || ""}
              onChange={handleChange}
              className="modern-input"
              max={new Date().toISOString().split('T')[0]}
            />
            {employee.dateOfBirth && (
              <span className="age-display">Age: {calculateAge(employee.dateOfBirth)} years</span>
            )}
          </div>

          <div className="form-group">
            <label className="input-label">
              <FaBuilding className="input-icon" />
              Department
            </label>
            {departmentsLoading ? (
              <div className="modern-input" style={{ padding: '0.75rem 1rem', color: '#6b7280' }}>
                Loading departments...
              </div>
            ) : (
              <select
                value={employee.departmentDTO?.id || ""}
                onChange={handleDepartmentChange}
                className="modern-select"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group full-width">
            <label className="input-label">Status</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="active"
                  checked={employee.active === true}
                  onChange={() => handleStatusChange(true)}
                />
                <span className="radio-custom">
                  <FaCheck className="radio-icon" />
                </span>
                Active
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="active"
                  checked={employee.active === false}
                  onChange={() => handleStatusChange(false)}
                />
                <span className="radio-custom">
                  <FaTimes className="radio-icon" />
                </span>
                Inactive
              </label>
            </div>
          </div>
        </div>

        <div className="form-actions-right">
          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? <FaSync className="spin" /> : <FaSave />}
            {employee.id ? "Update Employee" : "Add Employee"}
          </button>
        </div>
      </form>

      {isModalOpen && (
        <div className="modern-modal-overlay">
          <div className="modern-modal">
            <div className="modal-header">
              <h3>{modalMessage.includes("Error") ? "Error" : "Success"}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className={`modal-icon ${modalMessage.includes("Error") ? "error" : "success"}`}>
                {modalMessage.includes("Error") ? <FaTimes /> : <FaCheck />}
              </div>
              <p>{modalMessage}</p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn" onClick={() => setIsModalOpen(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EmployeeForm;