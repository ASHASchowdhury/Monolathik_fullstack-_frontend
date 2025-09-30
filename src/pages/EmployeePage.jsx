import React, { useState, useEffect } from "react";
import axios from "axios";
import EmployeeForm from "../components/EmployeeForm";
import EmployeeList from "../components/EmployeeList";

function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://10.0.6.1:8080/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleUpdateComplete = () => {
    fetchEmployees();
    setSelectedEmployee(null); // reset form
  };

  const handleViewEmployee = (employee) =>{
    console.log("Viewing employee :" ,employee);

    setSelectedEmployee(employee)
  }

  return (
    <div>
      <h1>Employee Management</h1>

      <EmployeeForm
        onEmployeeAdded={fetchEmployees}
        selectedEmployee={selectedEmployee}
        onUpdateComplete={handleUpdateComplete}
      />

      <EmployeeList
        employees={employees}
        onEmployeeDeleted={fetchEmployees}
        onEditEmployee={handleEditEmployee}
        onViewEmployee={handleViewEmployee}
      />
    </div>
  );
}

export default EmployeePage;