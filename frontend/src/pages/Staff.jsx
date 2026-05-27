import { useEffect, useState } from "react";
import axios from "axios";
import { 
  HeartPulse, 
  User, 
  Briefcase, 
  Plus, 
  Trash2, 
  AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRESET_ROLES = [
  "Attending Physician",
  "Resident Doctor",
  "Surgeon",
  "Registered Nurse",
  "Clinical Administrator",
  "Lab Technician",
  "Radiologist"
];

function Staff() {
  const [staff, setStaff] = useState([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Case Assignment States
  const [patients, setPatients] = useState([]);
  const [assigningStaffId, setAssigningStaffId] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");

  // =====================
  // GET STAFF
  // =====================
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const [staffRes, patientsRes] = await Promise.all([
        axios.get("http://localhost/api/v1/staff"),
        axios.get("http://localhost/api/v1/patients")
      ]);
      setStaff(staffRes.data);
      setPatients(patientsRes.data);
      setError("");
    } catch (error) {
      console.error("Staff Fetch Error:", error);
      setError("Failed to retrieve staff profiles from the directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // =====================
  // ADD STAFF
  // =====================
  const addStaff = async (e) => {
    e.preventDefault();
    if (!name.trim() || !role) {
      setError("Please fill out both Staff Name and Role.");
      return;
    }

    try {
      await axios.post("http://localhost/api/v1/staff", {
        name,
        role,
      });
      setName("");
      setRole("");
      setError("");
      fetchStaff();
    } catch (error) {
      console.error("Staff Post Error:", error);
      setError("Failed to register new medical staff profile.");
    }
  };

  // =====================
  // DELETE STAFF
  // =====================
  const deleteStaff = async (id) => {
    try {
      await axios.delete(`http://localhost/api/v1/staff/${id}`);
      fetchStaff();
    } catch (error) {
      console.error("Staff Delete Error:", error);
      setError("Failed to revoke staff credentials from roster.");
    }
  };

  // Case Assignment Handlers
  const handleAssignPatient = async (staffMember) => {
    if (!selectedPatientId) return;
    try {
      await axios.put(`http://localhost/api/v1/patients/${selectedPatientId}/assign`, {
        staff_id: staffMember.id,
        staff_name: staffMember.name
      });
      setSelectedPatientId("");
      setAssigningStaffId(null);
      fetchStaff(); // Re-fetch all data
    } catch (error) {
      console.error("Assign Patient Error:", error);
      setError("Failed to assign case profile to staff.");
    }
  };

  const handleReleasePatient = async (patientId) => {
    try {
      await axios.put(`http://localhost/api/v1/patients/${patientId}/unassign`);
      fetchStaff(); // Re-fetch all data
    } catch (error) {
      console.error("Release Patient Error:", error);
      setError("Failed to release patient case from roster.");
    }
  };

  // Helper for medical personnel badge colors
  const getRoleBadgeClasses = (role) => {
    const r = role.toLowerCase();
    if (r.includes("doctor") || r.includes("physician") || r.includes("surgeon")) {
      return "bg-blue-50 text-blue-700 border-blue-100/50";
    }
    if (r.includes("nurse")) {
      return "bg-purple-50 text-purple-700 border-purple-100/50";
    }
    if (r.includes("administrator")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-100/50";
    }
    return "bg-slate-50 text-slate-600 border-slate-100";
  };

  // Avatar initials utility
  const getInitials = (name) => {
    if (!name) return "MD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Subtitle Banner */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight sm:text-3xl">
          Medical Staff Roster
        </h1>
        <p className="text-sm font-medium text-slate-400 mt-1">
          Coordinate registered medical staff, roles, departments, and credentials.
        </p>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center gap-3 text-rose-800 text-sm font-semibold">
          <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* MAIN CONTAINER: Flex Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: Registration Form */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm sticky top-24">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HeartPulse className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              Staff Registration
            </h2>
          </div>

          <form onSubmit={addStaff} className="space-y-5">
            {/* Staff Name */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Full Legal Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Dr. Sophia Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-sm font-semibold outline-none transition-all duration-150"
                />
                <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Department Role Selection */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Hospital Assignment / Role
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-sm font-semibold outline-none transition-all duration-150 appearance-none cursor-pointer"
                >
                  <option value="">-- Choose Role Assignment --</option>
                  {PRESET_ROLES.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                </select>
                <Briefcase className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl py-3 text-sm font-bold shadow-md shadow-emerald-100 flex items-center justify-center gap-2 cursor-pointer transition-colors duration-150"
            >
              <Plus className="h-4 w-4" />
              Register Staff Member
            </motion.button>
          </form>
        </div>

        {/* RIGHT COLUMN: Staff List Table */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">Team Directory</h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                Current active medical personnel registered.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-500">
              {staff.length} Active
            </span>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <div className="h-8 w-8 border-3 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400">Refreshing Directory...</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <div className="inline-block min-w-full align-middle px-6">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Staff Member
                      </th>
                      <th scope="col" className="py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Roster ID
                      </th>
                      <th scope="col" className="py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Roster Role
                      </th>
                      <th scope="col" className="py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Credentials Management
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <AnimatePresence initial={false}>
                      {staff.length > 0 ? (
                        staff.map((member) => (
                           <motion.tr
                            key={member.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                            className="hover:bg-slate-50/50 transition-colors duration-150"
                          >
                            <td className="py-4 whitespace-normal pr-4 align-top">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 flex items-center justify-center text-xs font-extrabold flex-shrink-0">
                                  {getInitials(member.name)}
                                </div>
                                <span className="text-sm font-bold text-slate-700 pt-1 block">{member.name}</span>
                              </div>

                              {/* Active patients under care of this staff */}
                              {(() => {
                                const assigned = patients.filter((p) => p.assigned_staff_id === member.id);
                                if (assigned.length > 0) {
                                  return (
                                    <div className="mt-4 space-y-1.5 pl-12">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Under Active Care:</span>
                                      <div className="flex flex-wrap gap-2">
                                        {assigned.map((p) => (
                                          <div key={p.id} className="flex items-center gap-2 bg-slate-50 border border-slate-100/80 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
                                            <span>{p.name}</span>
                                            <button 
                                              onClick={() => handleReleasePatient(p.id)}
                                              className="text-rose-500 hover:text-rose-700 text-[10px] uppercase font-black cursor-pointer hover:underline border-l border-slate-200 pl-2.5 ml-1"
                                              title="Release Patient Case"
                                            >
                                              Release
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })()}

                              {/* Interactive Picker Overlay */}
                              {assigningStaffId === member.id && (
                                <div className="mt-4 pl-12 space-y-2 max-w-sm">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Assign Active Case:</span>
                                  <div className="flex gap-2">
                                    <select
                                      value={selectedPatientId}
                                      onChange={(e) => setSelectedPatientId(e.target.value)}
                                      className="bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none flex-1 cursor-pointer transition-colors"
                                    >
                                      <option value="">-- Choose Patient Case --</option>
                                      {patients.filter((p) => !p.assigned_staff_id).map((p) => (
                                        <option key={p.id} value={p.id}>
                                          {p.name} (#{p.id}) - {p.disease}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => handleAssignPatient(member)}
                                      disabled={!selectedPatientId}
                                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
                                    >
                                      Assign
                                    </button>
                                  </div>
                                  {patients.filter((p) => !p.assigned_staff_id).length === 0 && (
                                    <span className="text-[10px] text-rose-500 font-bold block mt-1">No unassigned patients registered in directory.</span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-4 whitespace-nowrap text-xs font-semibold text-slate-400 align-top pt-[20px]">
                              #ST-{member.id}
                            </td>
                            <td className="py-4 whitespace-nowrap align-top pt-[16px]">
                              <span className={`text-xs font-semibold border rounded-lg px-2.5 py-1 ${getRoleBadgeClasses(member.role)}`}>
                                {member.role}
                              </span>
                            </td>
                            <td className="py-4 whitespace-nowrap text-right align-top pt-[14px] space-x-2">
                              <button
                                onClick={() => {
                                  setAssigningStaffId(assigningStaffId === member.id ? null : member.id);
                                  setSelectedPatientId("");
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-150 cursor-pointer inline-flex items-center ${
                                  assigningStaffId === member.id
                                    ? "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                                    : "bg-blue-50 border-blue-100/50 hover:bg-blue-100 text-blue-600"
                                }`}
                              >
                                {assigningStaffId === member.id ? "Cancel" : "Assign Case"}
                              </button>
                              <button
                                onClick={() => deleteStaff(member.id)}
                                className="h-8 w-8 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100 text-slate-400 hover:text-rose-600 inline-flex items-center justify-center transition-all duration-150 cursor-pointer"
                                title="Revoke Staff Credentials / Remove Profile"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-sm font-semibold text-slate-400">
                            No medical team profiles currently registered.
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Staff;