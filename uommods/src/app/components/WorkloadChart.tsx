'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Props = {
    courseCode: string;
};



type Entry = {
    hours: number;
    schedule_types: { name:string };
};

type WorkloadItem = {
    label: string;
    hours: number;
    color: string;
};

const COLORS = [
    "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-orange-500",
    "bg-pink-500", "bg-teal-500", "bg-purple-500", "bg-red-500",
    "bg-cyan-500", "bg-lime-500", "bg-indigo-500", "bg-rose-500",
    "bg-emerald-500", "bg-fuchsia-500", "bg-violet-500"
];

export default function WorkloadChart({ courseCode }: Props) {
    const [workload, setWorkload] = useState<WorkloadItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalHours, setTotalHours] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            const { data, error } = await supabase
                .from('course_schedule')
                .select(`
                    hours,
                    schedule_types (
                        name
                    )
                `)
                .eq('course_code', courseCode);

            if (error || !data) {
                console.error('❌ Failed to fetch course workload:', error);
                setLoading(false);
                return;
            }

            console.log(data[0].schedule_types)




            const items: WorkloadItem[] = (data as unknown as Entry[]).map((entry, index) => ({
                label: entry.schedule_types.name,
                hours: entry.hours || 0,
                color: COLORS[index % COLORS.length]
            })).filter(item => item.hours > 0);

            setWorkload(items);
            setTotalHours(items.reduce((sum, item) => sum + Math.round(item.hours), 0));
            setLoading(false);
        };

        fetchData();
    }, [courseCode]);

    if (loading) return <p>Loading workload...</p>;
    if (workload.length === 0) return <p>No workload data available for this course.</p>;

    const boxes: { color: string; label: string }[] = [];
    workload.forEach((item) => {
        for (let i = 0; i < item.hours; i++) {
            boxes.push({ color: item.color, label: item.label });
        }
    });

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Weekly Workload ({totalHours} hrs)</h2>

            {/* Progress bar with hover tooltips */}
            <div className="flex flex-wrap gap-1">
                {boxes.map((box, index) => (
                    <div
                        key={index}
                        className={`w-6 h-6 rounded ${box.color} transition duration-200 hover:scale-110`}
                        title={box.label}
                    />
                ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
                {workload.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${item.color}`} />
                        <span>{item.label} ({Math.round(item.hours)} hrs)</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
