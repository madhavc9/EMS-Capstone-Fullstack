import React from "react";

export default function GradientBackground({ type = "hero", children }) {
  const backgrounds = {
    hero: "bg-gradient-to-b from-[#1E293B] via-[#111827] to-[#020617]",
    login: "bg-gradient-to-br from-[#1F2937] via-[#111827] to-[#020617]",
    dashboard: "bg-gradient-to-b from-[#1E293B] via-[#111827] to-[#020617]",
    flat: "bg-[#020617]",
  };

  return (
    <div className={`min-h-screen ${backgrounds[type]} py-12 px-4`}>
      {children}
    </div>
  );
}
