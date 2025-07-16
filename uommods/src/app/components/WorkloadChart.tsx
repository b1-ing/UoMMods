'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Props = {
    courseCode: string;
};

type WorkloadItem = {
    label: string;
    hours: number;
    color: string;
};

const COLUMN_STYLE: Record<string, { label: string; color: string }> = {
    scheduled_lectures: { label: "Lectures", color: "bg-blue-500" },
    scheduled_practical_classes__workshops: { label: "Workshops", color: "bg-green-500" },
    scheduled_project_supervision: { label: "Project Supervision", color: "bg-yellow-500" },
    scheduled_supervised_time_in_studiowksp: { label: "Supervised Studio", color: "bg-orange-500" },
    scheduled_tutorials: { label: "Tutorials", color: "bg-pink-500" },
    scheduled_demonstration: { label: "Demonstration", color: "bg-teal-500" },
    independent_independent_study: { label: "Independent Study", color: "bg-purple-500" },
};


export default function WorkloadChart({ courseCode }: Props) {
    const [workload, setWorkload] = useState<WorkloadItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalHours, setTotalHours] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: course, error } = await supabase
                .from('courses')
                .select('*')
                .eq('code', courseCode)
                .single();

            if (error || !course) {
                console.error('❌ Failed to fetch course workload:', error);
                setLoading(false);
                return;
            }

            const items: WorkloadItem[] = Object.entries(COLUMN_STYLE)
                .map(([column, { label, color }]) => ({
                    label,
                    hours: Number(course[column]) || 0,
                    color,
                }))
                .filter(item => item.hours > 0);


            setWorkload(items);
            setTotalHours(items.reduce((sum, item) => sum + item.hours, 0));
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

            <div className="flex flex-wrap gap-1">
                {boxes.map((box, index) => (
                    <div
                        key={index}
                        className={`w-6 h-6 rounded ${box.color}`}
                        title={box.label}
                    />
                ))}
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-sm">
                {workload.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${item.color}`} />
                        <span>{item.label} ({item.hours} hrs)</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
