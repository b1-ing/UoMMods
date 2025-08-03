"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ErrorBar,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';

type Props = {
    data?: {
        year: string;
        mean: number;
        n: number;
    }[];
    overallMean: number;
};

export default function GradeChart({ data, overallMean  }: Props) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value, name) => name === 'n' ? `${value} students` : `${value}`} />
                <Bar dataKey="mean" fill="#8884d8">
                    <ErrorBar dataKey="stdDev" width={4} strokeWidth={2} stroke="black" direction="y" />
                </Bar>
                <ReferenceLine
                    y={overallMean}
                    stroke="red"
                    strokeDasharray="5 5"
                    label={{ value: `Overall Mean: ${overallMean.toFixed(1)}`, position: 'top', fill: 'red' }}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
