"use client";
import dynamic from "next/dynamic";
import HeaderBar from "@/app/components/HeaderBar";

const Planner = dynamic(() => import("@/app/components/Planner"), {
  ssr: false, // 💥 THIS disables SSR and avoids the call error
});

export default function CoursePlanner() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-100 text-gray-800">
      <HeaderBar />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Course Planner</h1>
        <Planner />
      </div>
    </div>
  );
}
