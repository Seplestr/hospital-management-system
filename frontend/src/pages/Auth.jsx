import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { HeartPulse, Mail, Lock, User, Briefcase, AlertCircle } from "lucide-react";

function Auth() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Pre-fill remembered credentials on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("remembered_email");
    const rememberedPassword = localStorage.getItem("remembered_password");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
    if (rememberedPassword) {
      setPassword(rememberedPassword);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (rememberMe) {
      localStorage.setItem("remembered_email", email);
      localStorage.setItem("remembered_password", password);
    } else {
      localStorage.removeItem("remembered_email");
      localStorage.removeItem("remembered_password");
    }

    if (isLogin) {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.message);
        setLoading(false);
      }
    } else {
      if (!name.trim()) {
        setError("Please enter your full name.");
        setLoading(false);
        return;
      }
      const result = await register(name, email, password, role);
      if (!result.success) {
        setError(result.message);
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-tr-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-xl relative z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200 mb-4">
            <HeartPulse className="h-7 w-7" />
          </div>
          <h1 className="font-extrabold text-2xl text-slate-800 tracking-tight">
            Vector<span className="text-blue-600">HMS</span>
          </h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
            Clinical Suite Gateway
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center gap-3 text-rose-800 text-xs font-semibold"
          >
            <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Dr. Rajesh Pandey"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-sm font-semibold outline-none transition-all duration-150"
                  required
                />
                <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="e.g., admin@aurahms.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-sm font-semibold outline-none transition-all duration-150"
                required
              />
              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-sm font-semibold outline-none transition-all duration-150"
                required
              />
              <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {isLogin && (
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-200 text-blue-600 focus:ring-blue-500/20 h-4.5 w-4.5 cursor-pointer accent-blue-600 transition-all duration-150"
                />
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 uppercase tracking-wider select-none transition-colors duration-150">
                  Remember Me
                </span>
              </label>
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Roster Role
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-sm font-semibold outline-none transition-all duration-150 appearance-none cursor-pointer"
                >
                  <option value="admin">Chief Medical Officer (Admin)</option>
                  <option value="doctor">Attending Physician (Doctor)</option>
                  <option value="nurse">Clinical Nurse (Staff)</option>
                </select>
                <Briefcase className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl py-3.5 text-sm font-bold shadow-md shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer transition-colors duration-150 mt-6"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : isLogin ? (
              "Sign In to Portal"
            ) : (
              "Create Staff Credentials"
            )}
          </motion.button>
        </form>

        {/* Footer toggles */}
        <div className="mt-8 text-center border-t border-slate-50 pt-5">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            {isLogin
              ? "New Staff Member? Register Credentials"
              : "Already Registered? Login to Portal"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Auth;
