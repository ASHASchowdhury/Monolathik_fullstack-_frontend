import React, { useState } from "react";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeList from "./components/EmployeeList";
import DepartmentForm from "./components/DepartmentForm";
import DepartmentList from "./components/DepartmentList";
import "./App.css";

function App() {
  const [view, setView] = useState("employees");

  return (
    <div className="container">
      <h1>Office Management System</h1>
      <div className="nav">
        <button onClick={() => setView("employees")}>Employees</button>
        <button onClick={() => setView("departments")}>Departments</button>
      </div>

      {view === "employees" && (
        <>
          <EmployeeForm />
          <EmployeeList />
        </>
      )}

      {view === "departments" && (
        <>
          <DepartmentForm />
          <DepartmentList />
        </>
      )}
    </div>
  );
}

export default App;
