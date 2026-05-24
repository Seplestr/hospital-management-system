import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Staff from "./pages/Staff";
import Inventory from "./pages/Inventory";

function App() {
  return (
    <div className="app">

      <Sidebar />

      <div className="content">

        <Routes>

          <Route path="/" element={<Dashboard />} />

          <Route path="/patients" element={<Patients />} />

          <Route path="/staff" element={<Staff />} />

          <Route path="/inventory" element={<Inventory />} />

        </Routes>

      </div>

    </div>
  );
}

export default App;