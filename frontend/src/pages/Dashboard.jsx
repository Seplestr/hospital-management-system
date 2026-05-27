import { useEffect, useState } from "react";
import axios from "axios";
import StatCard from "../components/StatCard";
import { 
  Users, 
  HeartPulse, 
  Boxes, 
  Database,
  TrendingUp,
  Activity,
  Server,
  MonitorCheck,
  Coins
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";

// Premium Chart Mock Data (Weekly Trends)
const chartData = [
  { day: "Mon", Admissions: 12, Discharges: 8 },
  { day: "Tue", Admissions: 19, Discharges: 13 },
  { day: "Wed", Admissions: 15, Discharges: 15 },
  { day: "Thu", Admissions: 25, Discharges: 18 },
  { day: "Fri", Admissions: 32, Discharges: 24 },
  { day: "Sat", Admissions: 20, Discharges: 16 },
  { day: "Sun", Admissions: 28, Discharges: 22 },
];

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  // ====================================
  // FETCH DASHBOARD DATA
  // ====================================
  const fetchDashboard = async () => {
    try {
      const [patientsRes, staffRes, inventoryRes, ordersRes] = await Promise.all([
        axios.get("http://localhost/api/v1/patients"),
        axios.get("http://localhost/api/v1/staff"),
        axios.get("http://localhost/api/v1/inventory"),
        axios.get("http://localhost/api/v1/inventory/orders")
      ]);

      const sortedPatients = [...patientsRes.data]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);

      const supplyExpenses = ordersRes.data
        ? ordersRes.data.reduce((acc, order) => acc + order.amount, 0)
        : 0;

      setDashboard({
        total_patients: patientsRes.data.length,
        total_staff: staffRes.data.length,
        total_inventory: inventoryRes.data.length,
        recent_patients: sortedPatients,
        supply_expenses: supplyExpenses
      });
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-10 w-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-500">Loading Clinical Insights...</p>
      </div>
    );
  }

  // Get first letter initials for avatars
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
      {/* Page Title & Insight Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight sm:text-3xl">
            Clinical Overview
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Real-time analytics and patient tracking metrics.
          </p>
        </div>
      </div>

      {/* ========================= */}
      {/* METRIC GRID */}
      {/* ========================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={dashboard?.total_patients ?? 0}
          icon={Users}
          color="blue"
          trend={{ badge: "+12.4%", label: "admitted today" }}
        />
        <StatCard
          title="Medical Staff"
          value={dashboard?.total_staff ?? 0}
          icon={HeartPulse}
          color="emerald"
          trend={{ badge: "100%", label: "staff active" }}
        />
        <StatCard
          title="Inventory Items"
          value={dashboard?.total_inventory ?? 0}
          icon={Boxes}
          color="amber"
          trend={{ badge: "Optimal", label: "medical stock safe" }}
        />
        <StatCard
          title="Supply Expenses"
          value={dashboard?.supply_expenses ? `₹${dashboard.supply_expenses}` : "₹0"}
          icon={Coins}
          color="indigo"
          trend={{ badge: "Verified Logs", label: "total ledger purchases" }}
        />
      </div>

      {/* ========================= */}
      {/* INTERACTIVE CHART SECTION */}
      {/* ========================= */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Patient Admissions & Discharges Trend
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              Comparative view of hospital capacity metrics over the past 7 days.
            </p>
          </div>
          <div className="flex gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-slate-600 px-3 py-1.5 bg-white rounded-lg shadow-sm">
              Weekly
            </span>
            <span className="text-xs font-semibold text-slate-400 px-3 py-1.5">
              Monthly
            </span>
          </div>
        </div>

        <div className="h-80 w-full chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01}/>
                </linearGradient>
                <linearGradient id="colorDischarges" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} />
              <Tooltip 
                contentStyle={{ 
                  background: '#ffffff', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)'
                }}
                labelStyle={{ fontWeight: 700, color: '#1e293b' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontWeight: 600, color: '#64748b' }} />
              <Area type="monotone" dataKey="Admissions" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAdmissions)" />
              <Area type="monotone" dataKey="Discharges" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDischarges)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================= */}
      {/* BOTTOM SECTION */}
      {/* ========================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RECENT PATIENTS */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Recent Admissions</h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                The latest 5 patients admitted into the clinic database.
              </p>
            </div>
            <a href="/patients" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">
              View All
            </a>
          </div>

          <div className="overflow-x-auto -mx-6">
            <div className="inline-block min-w-full align-middle px-6">
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr>
                    <th scope="col" className="py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Patient Details
                    </th>
                    <th scope="col" className="py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Diagnosis / Disease
                    </th>
                    <th scope="col" className="py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {dashboard?.recent_patients && dashboard.recent_patients.length > 0 ? (
                    dashboard.recent_patients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                        <td className="py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50 flex items-center justify-center text-xs font-extrabold flex-shrink-0">
                              {getInitials(patient.name)}
                            </div>
                            <span className="text-sm font-bold text-slate-700">{patient.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 whitespace-nowrap text-xs font-semibold text-slate-400">
                          #{patient.id}
                        </td>
                        <td className="py-3.5 whitespace-nowrap">
                          <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
                            {patient.disease}
                          </span>
                        </td>
                        <td className="py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-0.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 status-pulse-dot" />
                            Admitted
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm font-medium text-slate-400">
                        No recent patient records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CLINICAL OPERATIONAL BOARD */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">Clinical Operations Roster</h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5 mb-6">
            Live notice board for active hospital operations and wing statuses.
          </p>

          <div className="space-y-6">
            {/* ICU Case Status */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-9 w-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <Activity className="h-4.5 w-4.5 animate-pulse" />
                </div>
                <div className="w-[2px] flex-1 bg-slate-100 my-1" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">ICU & Emergency Wing Status</h4>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                  Operating at standard load capacity. 4 intensive care bed units are currently available.
                </p>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-md px-1.5 py-0.5 mt-2 inline-block">
                  Optimal Load
                </span>
              </div>
            </div>

            {/* Medical Personnel Status */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <HeartPulse className="h-4.5 w-4.5" />
                </div>
                <div className="w-[2px] flex-1 bg-slate-100 my-1" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">Medical Shift Allocation Check</h4>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                  Shift schedules for all medical personnel, attending physicians, and clinical staff are fully allocated.
                </p>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md px-1.5 py-0.5 mt-2 inline-block">
                  100% Scheduled
                </span>
              </div>
            </div>

            {/* Clinical Supplies Status */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Boxes className="h-4.5 w-4.5" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">Clinical Supplies & Pharmacy Stock</h4>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                  All critical pharmaceutical vaccines, surgical instruments, and personal protective items are within healthy parameters.
                </p>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-1.5 py-0.5 mt-2 inline-block">
                  Registry Stable
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;