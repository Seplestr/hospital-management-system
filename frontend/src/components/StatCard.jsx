import { motion } from "framer-motion";

function StatCard({ title, value, icon: Icon, color = "blue", trend }) {
  const colorMap = {
    blue: {
      bg: "bg-blue-50/70",
      text: "text-blue-600",
      border: "border-blue-100/50",
      gradient: "from-blue-500/5 to-transparent",
    },
    emerald: {
      bg: "bg-emerald-50/70",
      text: "text-emerald-600",
      border: "border-emerald-100/50",
      gradient: "from-emerald-500/5 to-transparent",
    },
    amber: {
      bg: "bg-amber-50/70",
      text: "text-amber-600",
      border: "border-amber-100/50",
      gradient: "from-amber-500/5 to-transparent",
    },
    indigo: {
      bg: "bg-indigo-50/70",
      text: "text-indigo-600",
      border: "border-indigo-100/50",
      gradient: "from-indigo-500/5 to-transparent",
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      whileHover={{ y: -4, shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`bg-white border border-slate-100 rounded-2xl p-6 shadow-sm relative overflow-hidden flex justify-between items-center`}
    >
      {/* Decorative Subtle Accent Gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${scheme.gradient} rounded-bl-full pointer-events-none`} />

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {title}
          </span>
          <span className="text-3xl font-extrabold text-slate-800 mt-1 block tracking-tight">
            {value}
          </span>
        </div>
        
        {trend && (
          <div className="mt-4 flex items-center gap-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scheme.bg} ${scheme.text}`}>
              {trend.badge}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {trend.label}
            </span>
          </div>
        )}
      </div>

      {/* Decorative Icon */}
      {Icon && (
        <div className={`h-12 w-12 rounded-2xl ${scheme.bg} ${scheme.text} flex items-center justify-center relative z-10 shadow-sm border ${scheme.border} flex-shrink-0`}>
          <Icon className="h-6 w-6" />
        </div>
      )}
    </motion.div>
  );
}

export default StatCard;