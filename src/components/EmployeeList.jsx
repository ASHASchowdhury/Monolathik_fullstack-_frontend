import React, { useState, useEffect } from "react";
import axios from "axios";

function EmployeeList() {
  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    const res= await axios.get("http://localhost:8080/api/employees");
    setEmployees(res.data);
  };
  
  const deleteEmployee = async (id) => {
    await axios.delete('http://localhost:8080/api/employees/' + id);
    fetchEmployees();
  };

    useEffect(() => {   
        fetchEmployees();
    }, []);

  return (
    <div className="list">
        <h2>Employees</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th> 
                    <th>Department ID</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {employees.map(emp => (
                    <tr key={emp.id}>
                        <td>{emp.id}</td>
                        <td>{emp.name}</td>
                        <td>{emp.email}</td>
                        <td>{emp.departmentId}</td>
                        <td>
                            <button onClick={() => deleteEmployee(emp.id)}>Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}
export default EmployeeList;