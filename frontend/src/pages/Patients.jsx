import { useEffect, useState } from "react";
import axios from "axios";

function Patients() {

  const [patients, setPatients] = useState([]);

  const [name, setName] = useState("");

  const [disease, setDisease] = useState("");

  // =====================
  // GET PATIENTS
  // =====================

  const fetchPatients = async () => {

    const res = await axios.get(
      "http://127.0.0.1:8000/patients"
    );

    setPatients(res.data);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // =====================
  // ADD PATIENT
  // =====================

  const addPatient = async () => {

    await axios.post(
      "http://127.0.0.1:8000/patients",
      {
        name,
        disease
      }
    );

    setName("");
    setDisease("");

    fetchPatients();
  };

  // =====================
  // DELETE PATIENT
  // =====================

  const deletePatient = async (id) => {

    await axios.delete(
      `http://127.0.0.1:8000/patients/${id}`
    );

    fetchPatients();
  };

  return (
    <div>

      <h1 className="page-title">
        Patients
      </h1>

      <div className="form">

        <input
          type="text"
          placeholder="Patient Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Disease"
          value={disease}
          onChange={(e) => setDisease(e.target.value)}
        />

        <button onClick={addPatient}>
          Add Patient
        </button>

      </div>

      <div className="table-container">

        <table>

          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Disease</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {patients.map((patient) => (

              <tr key={patient.id}>

                <td>{patient.id}</td>

                <td>{patient.name}</td>

                <td>{patient.disease}</td>

                <td>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      deletePatient(patient.id)
                    }
                  >
                    Remove
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Patients;