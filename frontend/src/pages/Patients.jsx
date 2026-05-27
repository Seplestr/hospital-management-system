import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Users, 
  User, 
  Stethoscope, 
  Plus, 
  Trash2, 
  Activity, 
  AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [name, setName] = useState("");
  const [disease, setDisease] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("unassigned");

  // Filter patients based on assignment state
  const filteredPatients = patients.filter((patient) => {
    if (activeTab === "unassigned") {
      return !patient.assigned_staff_id;
    }
    return true;
  });

  // =====================
  // GET PATIENTS
  // =====================
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost/api/v1/patients");
      setPatients(res.data);
      setError("");
    } catch (error) {
      console.error("Patients Fetch Error:", error);
      setError("Failed to retrieve patients records from the clinical database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // =====================
  // ADD PATIENT
  // =====================
  const addPatient = async (e) => {
    e.preventDefault();
    if (!name.trim() || !disease.trim()) {
      setError("Please fill out both Patient Name and Diagnosis fields.");
      return;
    }

    try {
      await axios.post("http://localhost/api/v1/patients", {
        name,
        disease,
      });
      setName("");
      setDisease("");
      setError("");
      fetchPatients();
    } catch (error) {
      console.error("Patients Post Error:", error);
      setError("Failed to submit patient registration details.");
    }
  };

  // =====================
  // DELETE PATIENT
  // =====================
  const deletePatient = async (id) => {
    try {
      await axios.delete(`http://localhost/api/v1/patients/${id}`);
      fetchPatients();
    } catch (error) {
      console.error("Patients Delete Error:", error);
      setError("Failed to revoke patient registration record.");
    }
  };

  // Avatar initials utility
  const getInitials = (name) => {
    if (!name) return "PT";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Intro Banner */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight sm:text-3xl">
          Patients Directory
        </h1>
        <p className="text-sm font-medium text-slate-400 mt-1">
          Manage clinical admissions, diagnose active cases, and register new patients.
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
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              Admission Registration
            </h2>
          </div>

          <form onSubmit={addPatient} className="space-y-5">
            {/* Patient Name */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Patient Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Jonathan Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-sm font-semibold outline-none transition-all duration-150"
                />
                <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Disease / Diagnosis */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Clinical Diagnosis
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Acute Appendicitis"
                  value={disease}
                  onChange={(e) => setDisease(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-sm font-semibold outline-none transition-all duration-150"
                />
                <Stethoscope className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl py-3 text-sm font-bold shadow-md shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer transition-colors duration-150"
            >
              <Plus className="h-4 w-4" />
              Register Patient
            </motion.button>
          </form>
        </div>

        {/* RIGHT COLUMN: Patients List Table */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-5 border-b border-slate-50">
            <div>
              <h2 className="text-base font-bold text-slate-800">Admissions Ledger</h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                A live listing of active hospital case profiles.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
                <button
                  onClick={() => setActiveTab("unassigned")}
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === "unassigned"
                      ? "bg-white text-blue-600 shadow-sm border border-slate-100"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Unassigned
                </button>
                <button
                  onClick={() => setActiveTab("all")}
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === "all"
                      ? "bg-white text-blue-600 shadow-sm border border-slate-100"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  All Cases
                </button>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-500">
                {filteredPatients.length} Active
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <div className="h-8 w-8 border-3 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400">Refreshing Ledger...</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <div className="inline-block min-w-full align-middle px-6">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Patient Profile
                      </th>
                      <th scope="col" className="py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Database ID
                      </th>
                      <th scope="col" className="py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Diagnosis
                      </th>
                      <th scope="col" className="py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Management
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <AnimatePresence initial={false}>
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <motion.tr
                            key={patient.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                            className="hover:bg-slate-50/50 transition-colors duration-150"
                          >
                            <td className="py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50 flex items-center justify-center text-xs font-extrabold flex-shrink-0">
                                  {getInitials(patient.name)}
                                </div>
                                <div>
                                  <span className="text-sm font-bold text-slate-700 block">{patient.name}</span>
                                  {patient.assigned_staff_name ? (
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block mt-0.5">
                                      Care: {patient.assigned_staff_name}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mt-0.5">
                                      Unassigned Case
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 whitespace-nowrap text-xs font-semibold text-slate-400">
                              #PT-{patient.id}
                            </td>
                            <td className="py-3.5 whitespace-nowrap">
                              <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
                                {patient.disease}
                              </span>
                            </td>
                            <td className="py-3.5 whitespace-nowrap text-right">
                              <button
                                onClick={() => deletePatient(patient.id)}
                                className="h-8 w-8 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100 text-slate-400 hover:text-rose-600 inline-flex items-center justify-center transition-all duration-150 cursor-pointer"
                                title="Discharge / Remove Case Record"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-sm font-semibold text-slate-400">
                            No patient records currently registered in active rosters.
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

export default Patients;