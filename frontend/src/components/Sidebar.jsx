import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  HeartPulse, 
  Boxes,
  ShieldCheck
} from "lucide-react";

function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/patients", label: "Patients", icon: Users },
    { path: "/staff", label: "Medical Staff", icon: HeartPulse },
    { path: "/inventory", label: "Inventory", icon: Boxes },
  ];

  return (
    <div className="w-64 min-h-screen bg-white border-r border-slate-100 flex flex-col sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200 group-hover:scale-105 transition-transform duration-200">
            <HeartPulse className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight tracking-tight text-slate-800">
              Vector<span className="text-blue-600">HMS</span>
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Clinical Operations
            </p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {links.map((link) => {
          const isActive = currentPath === link.path;
          const Icon = link.icon;

          return (
            <Link key={link.path} to={link.path} className="block relative">
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "text-blue-600 bg-blue-50/70"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                <span>{link.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-3 bottom-3 w-1 bg-blue-600 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Database Integration / Health Badge */}
      <div className="p-4 m-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-emerald-800">Protected Mode</h4>
          <p className="text-[10px] text-emerald-600/90 font-medium">DB Connection Secure</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;