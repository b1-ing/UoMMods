"use client";

import React from "react";
import HeaderBar from "@/app/components/HeaderBar"; // Adjust import path if needed
import ProgramDependencyGraph from "@/app/components/ProgramDependencyGraph"; // Adjust import path
import {Layers } from "lucide-react";

export default function DependencyGraphPage() {

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            {/* Main Shared Navigation Header Bar */}
            <HeaderBar />

            {/* Sub-Header Banner */}
            <div className="border-b border-slate-800/80 bg-slate-900/40 px-6 py-4">
                <div className="container mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                            <Layers className="w-5 h-5 text-indigo-400" />
                            Program Dependency Graph
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Interactive visual mapping of module prerequisites, co-requisites, and course progression.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Interactive Graph Workspace */}
            <main className="flex-1 container mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
                {/* Visual Canvas Container */}
                <div className="flex-1 h-[75vh] min-h-[550px] border border-slate-800 rounded-xl overflow-hidden shadow-2xl bg-slate-900/30 relative">
                    <ProgramDependencyGraph
                        program_id={"G400"}
                    />
                </div>

            </main>
        </div>
    );
}