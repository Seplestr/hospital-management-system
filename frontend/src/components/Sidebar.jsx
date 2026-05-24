import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">

      <h2 className="logo">HMS</h2>

      <div className="nav-links">

        <Link to="/">Dashboard</Link>

        <Link to="/patients">Patients</Link>

        <Link to="/staff">Staff</Link>

        <Link to="/inventory">Inventory</Link>

      </div>

    </div>
  );
}

export default Sidebar;