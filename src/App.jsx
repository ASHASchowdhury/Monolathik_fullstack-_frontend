import React, { useState } from "react";
import EmployeePage from "./pages/EmployeePage";
import DepartmentPage from "./pages/DepartmentPage";
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

      {view === "employees" && <EmployeePage />}
      {view === "departments" && <DepartmentPage />}
    </div>
  );
}

export default App;
