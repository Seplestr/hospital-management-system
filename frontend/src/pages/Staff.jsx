import { useEffect, useState } from "react";
import axios from "axios";

function Staff() {

  const [staff, setStaff] = useState([]);

  const [name, setName] = useState("");

  const [role, setRole] = useState("");

  const fetchStaff = async () => {

    const res = await axios.get(
      "http://127.0.0.1:8000/staff"
    );

    setStaff(res.data);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const addStaff = async () => {

    await axios.post(
      "http://127.0.0.1:8000/staff",
      {
        name,
        role
      }
    );

    setName("");
    setRole("");

    fetchStaff();
  };

  const deleteStaff = async (id) => {

    await axios.delete(
      `http://127.0.0.1:8000/staff/${id}`
    );

    fetchStaff();
  };

  return (
    <div>

      <h1 className="page-title">
        Staff
      </h1>

      <div className="form">

        <input
          type="text"
          placeholder="Staff Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <button onClick={addStaff}>
          Add Staff
        </button>

      </div>

      <div className="table-container">

        <table>

          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {staff.map((member) => (

              <tr key={member.id}>

                <td>{member.id}</td>

                <td>{member.name}</td>

                <td>{member.role}</td>

                <td>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      deleteStaff(member.id)
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

export default Staff;