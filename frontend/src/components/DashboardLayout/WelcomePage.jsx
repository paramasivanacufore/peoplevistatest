import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/images/Logo.png";

export default function WelcomePage() {
  const { user } = useAuth();

  return (
    <div
      className="
        w-full h-full flex items-center justify-center
        p-6
      "
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="
          bg-white rounded-3xl
          px-10 py-12
          max-w-md w-full text-center
          border border-slate-200
        "
        style={{
          boxShadow: "0 30px 80px rgba(1,23,72,.18)",
        }}
      >
        {/* Logo / Brand Circle */}
        <div
          className="
            w-16 h-16 mx-auto mb-6
            rounded-full flex items-center justify-center
            text-xl font-bold
          "
          style={{
            background:
              "linear-gradient(135deg, #011748 0%, #00123A 100%)",
            color: "#F9B722",
            boxShadow: "0 12px 30px rgba(1,23,72,.35)",
          }}
        >
          <img src={Logo} alt="PeopleVista Logo" className="w-8 h-8 object-contain" />
        </div>

        {/* Welcome Text */}
        <h1 className="text-3xl font-semibold text-slate-800">
          Welcome {user?.first_name} {user?.last_name}
        </h1>

        <p className="mt-3 text-slate-500 text-sm">
          You’re logged in to{" "}
          <span className="font-semibold text-[#011748]">
            PeopleVista HRMS
          </span>
        </p>

        {/* Divider */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* Hint */}
        <p className="text-sm text-slate-500 leading-relaxed">
          Use the{" "}
          <span className="font-medium text-slate-700">
            sidebar navigation
          </span>{" "}
          to access your modules and manage your organization efficiently.
        </p>
      </motion.div>
    </div>
  );
}
