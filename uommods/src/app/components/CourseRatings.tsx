'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// OverallRatings component from earlier
const Star = ({ filled }: { filled: boolean }) => (
    <svg
        className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.167c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.966c.3.92-.755 1.688-1.54 1.117L10 13.347l-3.37 2.448c-.785.57-1.84-.197-1.54-1.117l1.287-3.966a1 1 0 00-.364-1.118L3.644 9.393c-.783-.57-.38-1.81.588-1.81h4.167a1 1 0 00.95-.69l1.286-3.966z" />
    </svg>
);

const RatingBar = ({ label, value }: { label: string; value: number }) => {
    const filledStars = Math.round(value);
    return (
        <div className="flex items-center space-x-2">
            <div className="w-24 font-semibold">{label}</div>
            <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} filled={i <= filledStars} />
                ))}
            </div>
            <div className="ml-2 text-sm">{value.toFixed(1)}/5.0</div>
        </div>
    );
};

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
    return (
        <div className="flex bg-white p-6 rounded-xl shadow-md border border-gray-200 max-w-2xl w-full mx-auto mb-8">
            {/* Left side: Big overall score */}
            <div className="flex flex-col justify-center items-center w-1/3 border-r pr-6">
                <div className="text-5xl font-extrabold text-black leading-tight">{overall.toFixed(1)}</div>
                <div className="text-sm text-gray-500">Overall Score</div>
            </div>
            <div className="space-y-3">
                <RatingBar label="Difficulty" value={difficulty}/>
                <RatingBar label="Teaching Quality" value={quality}/>
                <RatingBar label="Enjoyment" value={enjoyment}/>
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
                <div key={r.id} className="border rounded p-4 shadow-sm bg-white">
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
                        <p className="mt-2 italic text-muted-foreground">“{r.comment}”</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                        Posted on {new Date(r.created_at).toLocaleDateString()}
                    </p>
                </div>
            ))}
        </div>
    );
}
