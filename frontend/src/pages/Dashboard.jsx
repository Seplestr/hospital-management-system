import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {

  const [dashboard, setDashboard] = useState(null);

  // ====================================
  // FETCH DASHBOARD DATA
  // ====================================

  const fetchDashboard = async () => {

    try {

      const res = await axios.get(
        "http://127.0.0.1:8000/dashboard"
      );

      setDashboard(res.data);

    } catch (error) {

      console.error(error);

    }

  };

  useEffect(() => {

    fetchDashboard();

  }, []);

  if (!dashboard) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>

      <h1 className="page-title">
        Dashboard
      </h1>

      {/* ========================= */}
      {/* STATS */}
      {/* ========================= */}

      <div className="stats-grid">

        <div className="card">
          <h3>Total Patients</h3>
          <p>{dashboard.total_patients}</p>
        </div>

        <div className="card">
          <h3>Total Staff</h3>
          <p>{dashboard.total_staff}</p>
        </div>

        <div className="card">
          <h3>Inventory Items</h3>
          <p>{dashboard.total_inventory}</p>
        </div>

        <div className="card">
          <h3>Database</h3>
          <p>{dashboard.database}</p>
        </div>

      </div>

      {/* ========================= */}
      {/* BOTTOM SECTION */}
      {/* ========================= */}

      <div className="dashboard-bottom">

        {/* ========================= */}
        {/* RECENT PATIENTS */}
        {/* ========================= */}

        <div className="table-container recent-patients">

          <h2 className="section-title">
            Recent Patients
          </h2>

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Disease</th>
              </tr>
            </thead>

            <tbody>

              {dashboard.recent_patients.map(
                (patient) => (

                  <tr key={patient.id}>

                    <td>{patient.id}</td>

                    <td>{patient.name}</td>

                    <td>{patient.disease}</td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

        {/* ========================= */}
        {/* ACTIVITY */}
        {/* ========================= */}

        <div className="activity-panel">

          <h2 className="section-title">
            Activity
          </h2>

          <div className="activity-card">
            MongoDB Atlas Connected
          </div>

          <div className="activity-card">
            FastAPI Backend Running
          </div>

          <div className="activity-card">
            React Frontend Active
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;