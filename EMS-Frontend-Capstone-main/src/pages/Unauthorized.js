// src/pages/Unauthorized.js
import React from "react";
import GradientBackground from "../components/GradientBackground";
import FrostedCard from "../components/FrostedCard";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <GradientBackground type="login">
      <div className="flex items-center justify-center">
        <FrostedCard className="text-center max-w-md">
          <div className="text-3xl mb-3">❌</div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Access Denied
          </h1>
          <p className="text-sm text-[#CBD5F5] mb-4">
            You are not authorized to access this page.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded"
          >
            Go to Home
          </button>
        </FrostedCard>
      </div>
    </GradientBackground>
  );
}
