// app/components/ProgramTabs.tsx
"use client";
import { supabase } from '@/lib/supabase'
import { useState } from "react";
import ProgramDependencyGraph from "@/app/components/ProgramDependencyGraph";





const {data: programs} = await supabase
    .from('programs')
    .select('program_id')

export default function ProgramTabs({
                                        initialProgramId,
                                        selectedcourseid
                                    }: {
    initialProgramId?: string;
    selectedcourseid?: string;
}) {
    const defaultId = initialProgramId ?? programs?.[0]?.program_id ?? "";
    const [selected, setSelected] = useState<string>(defaultId);




    return (
        <div className="space-y-4">
            <div className="flex border-b overflow-x-auto">
                {programs?.map((p) => (
                    <button
                        key={p.program_id}
                        onClick={() => setSelected(p.program_id)}
                        className={`px-4 py-2 -mb-px font-medium transition ${
                            selected === p.program_id
                                ? "border-b-2 border-indigo-600 text-indigo-600"
                                : "text-gray-600 hover:text-indigo-500"
                        }`}
                    >
                        {p.program_id}
                    </button>
                ))}
            </div>
            <div>
                <ProgramDependencyGraph program_id={selected}  selectedcourseid={selectedcourseid}/>
            </div>
        </div>
    );
}
