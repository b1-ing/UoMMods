'use client';


type Props = {
    Lectures: number | undefined,
    Workshops: number | undefined,
    Placement: number| undefined,
    Study: number| undefined,
    Labs?: number| undefined
}

type WorkloadItem = {
    label: string;
    hours: number;
    color: string; // Tailwind color
};

export default function WorkloadChart({Lectures, Workshops, Placement, Study, Labs}: Props) {
    const workload: WorkloadItem[] = [
        {label: 'Lectures', hours: Lectures ?? 0, color: 'bg-blue-500'},
        {label: 'Workshops', hours: Workshops ?? 0, color: 'bg-green-500'},
        {label: 'Independent Study', hours: Study?? 0, color: 'bg-purple-500'},
        {label: 'Labs', hours: Labs?? 0, color: 'bg-purple-500'},
        {label: 'Placement', hours: Placement?? 0, color: 'bg-gray-400'},
    ].filter(item => item.hours > 0);
    const totalHours = workload.reduce((sum, item) => sum + item.hours, 0);

    // Build 1 box per hour, each box inherits the color of the activity type
    const boxes: { color: string; label: string }[] = [];

    workload.forEach((item) => {
        for (let i = 0; i < item.hours; i++) {
            boxes.push({color: item.color, label: item.label});
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
                        <div className={`w-4 h-4 rounded ${item.color}`}/>
                        <span>{item.label} ({item.hours} hrs)</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
