'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {Star} from "lucide-react"

// OverallRatings component from earlier


function RatingBar({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                    <Star
                        key={v}
                        size={18}
                        className="text-yellow-500"
                        fill={v <= value ? "currentColor" : "none"}
                        stroke="currentColor"
                    />
                ))}
            </div>
        </div>
    );
}

function OverallRatings({
                            difficulty,
                            quality,
                            enjoyment,
                        }: {
    difficulty: number;
    quality: number;
    enjoyment: number;
}) {
    const overall = (difficulty + quality + enjoyment) / 3;
    const percentage = Math.min((overall / 5) * 100, 100);

    return (
        <div className="mt-6 p-6 border rounded-md shadow-sm space-y-4 w-full mx-auto bg-white flex flex-col md:flex-row items-center gap-6">
            {/* Left: Larger, thinner circular score */}
            <div className="relative w-36 h-36 flex-shrink-0">
                <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="#e5e7eb"
                        strokeWidth="4" // thinner stroke
                        fill="none"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="black"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="282.74"
                        strokeDashoffset={282.74 - (percentage / 100) * 282.74}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-black">
                        {overall.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500">/ 5.0</div>
                </div>
            </div>

            {/* Right: Rating bars with stars */}
            <div className="flex-1 w-full space-y-4">
                <RatingBar label="Difficulty" value={difficulty} />
                <RatingBar label="Teaching Quality" value={quality} />
                <RatingBar label="Enjoyment" value={enjoyment} />
            </div>
        </div>
    );
}


type Props = {
    courseCode: string;
    refreshFlag?: boolean;
};

type Rating = {
    id: string;
    difficulty: number;
    quality: number;
    enjoyment: number;
    comment?: string;
    created_at: string;
    fullname: string;
};

export default function CourseRatings({courseCode, refreshFlag}: Props) {
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRatings() {
            setLoading(true);
            const { data, error } = await supabase
                .from('ratings')
                .select('*')
                .eq('course_code', courseCode)
                .order('created_at', { ascending: false });
            if (!error) setRatings(data || []);
            setLoading(false);
        }

        fetchRatings();
    }, [courseCode, refreshFlag]);

    if (loading) return <p>Loading ratings...</p>;
    if (ratings.length === 0) return <p className="text-muted-foreground">No ratings yet.</p>;

    // Calculate averages
    const avgDifficulty =
        ratings.reduce((acc, r) => acc + r.difficulty, 0) / ratings.length;
    const avgQuality = ratings.reduce((acc, r) => acc + r.quality, 0) / ratings.length;
    const avgEnjoyment = ratings.reduce((acc, r) => acc + r.enjoyment, 0) / ratings.length;

    return (
        <div className="space-y-4 mt-8">
            {/* Overall ratings summary */}
            <OverallRatings
                difficulty={avgDifficulty}
                quality={avgQuality}
                enjoyment={avgEnjoyment}
            />

            {/* Individual ratings list */}
            <h2 className="text-xl font-semibold">Student Ratings & Comments</h2>
            {ratings.map((r) => (
                <div key={r.id} className="border rounded-lg p-4 shadow-sm bg-white">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold text-lg">
                            {decodeURIComponent(r.fullname).charAt(0)}
                        </div>
                        <h2 className="text-lg font-bold">{decodeURIComponent(r.fullname)}</h2>
                    </div>
                    <p>
                        <strong>Difficulty:</strong> {r.difficulty}/5
                    </p>
                    <p>
                        <strong>Teaching Quality:</strong> {r.quality}/5
                    </p>
                    <p>
                        <strong>Enjoyment:</strong> {r.enjoyment}/5
                    </p>
                    {r.comment && (
                        <p className="mt-2">{r.comment}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                        Posted on {new Date(r.created_at).toLocaleDateString()}
                    </p>
                </div>
            ))}
        </div>
    );
}
