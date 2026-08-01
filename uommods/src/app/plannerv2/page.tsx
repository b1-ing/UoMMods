"use client"

import HeaderBar from "@/app/components/HeaderBar";
import PlannerV2 from "@/app/components/PlannerV2";
import { Program } from "@/lib/types";
import { programs } from "@/lib/programs";

export default function PlannerV2Page() {
    const programMap: Record<string, Program> = {};
    programs.forEach((p: Program) => {
        programMap[p.program_id] = p;
    });

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <HeaderBar />
            <PlannerV2 programs={programMap} />
        </div>
    );
}
