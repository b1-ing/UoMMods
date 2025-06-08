'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type Props = {
    courseName: string;
    Lecture: number;
    Workshops: number;
    Placement:number;
    Study: number

}

type WorkloadItem = {
    label: string;
    hours: number;
    color: string; // Tailwind color
};

export default function WorkloadChart({courseName, Lectures, Workshops, Placement, Study} : Props) {
    let workload: WorkloadItem[]  = [
        { label: 'Lectures', hours: 2, color: 'bg-blue-500' },
        { label: 'Workshops', hours: 1, color: 'bg-green-500' },
        { label: 'Independent Study', hours: 6, color: 'bg-purple-500' },
        { label: 'Placement', hours: 0, color: 'bg-gray-400' },
    ];
    const totalHours = workload.reduce((sum, item) => sum + item.hours, 0);

    // Build 1 box per hour, each box inherits the color of the activity type
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
