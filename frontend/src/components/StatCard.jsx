import { motion } from "framer-motion";

function StatCard({ title, value }) {
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        y: -5,
      }}
      transition={{ duration: 0.3 }}
      className="bg-white/10 border border-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl"
    >

      <h2 className="text-gray-300 text-lg">
        {title}
      </h2>

      <p className="text-4xl font-bold mt-3 text-purple-300">
        {value}
      </p>

    </motion.div>
  );
}

export default StatCard;