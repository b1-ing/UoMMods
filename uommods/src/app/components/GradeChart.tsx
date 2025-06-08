"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ErrorBar, ResponsiveContainer } from 'recharts';

type Props = {
    data: {
        year: string;
        mean: number;
        stdDev: number;
        n: number;
    }[];
};

export default function GradeChart({ data }: Props) {
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
            </BarChart>
        </ResponsiveContainer>
    );
}
