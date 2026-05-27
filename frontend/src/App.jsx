import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Staff from "./pages/Staff";
import Inventory from "./pages/Inventory";
import Auth from "./pages/Auth";
import { useAuth } from "./context/AuthContext";
import { Calendar, Bell, LogOut, ChevronDown } from "lucide-react";

function App() {
  const { user, loading, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const options = { weekday: "short", month: "short", day: "numeric" };
    setCurrentDate(new Date().toLocaleDateString("en-US", options));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-3">
        <div className="h-10 w-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-500">Connecting Secure Session...</p>
      </div>
    );
  }

  // Auth Guard: If session not authenticated, show premium Login/Signup interface
  if (!user) {
    return <Auth />;
  }

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Screen Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Navigation */}
        <header className="h-18 bg-white border-b border-slate-100 flex items-center justify-between px-8   z-10 shadow-sm shadow-slate-100/50">
          {/* Welcome Message */}
          <div>
            <h2 className="text-sm font-semibold text-slate-400">Hospital Administration</h2>
            <h1 className="text-base font-bold text-slate-800">
              Hello, {user.name || "Chief Officer"}
            </h1>
          </div>

          {/* Quick Stats & Admin Profile */}
          <div className="flex items-center gap-6">
            {/* Today's Date */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>{currentDate}</span>
            </div>

            {/* Simulated Notification Indicator */}
            <button className="h-9 w-9 rounded-lg hover:bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 relative transition-colors duration-150">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-blue-600 status-pulse-dot" />
            </button>

            <div className="h-6 w-[1px] bg-slate-100" />

            {/* Profile Avatar & Logout Group */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=120&auto=format&fit=crop"
                    alt="Doctor Profile"
                    className="h-10 w-10 rounded-xl object-cover ring-2 ring-blue-50 shadow-sm"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div className="hidden md:block">
                  <h3 className="text-sm font-bold text-slate-700 leading-none">
                    {user.name}
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
                    {user.role}
                  </p>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="h-9 w-9 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-all duration-150 cursor-pointer"
                title="Sign Out of Portal"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Route Pages Canvas */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/inventory" element={<Inventory />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;