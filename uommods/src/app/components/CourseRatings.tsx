'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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

export default function CourseRatings({ courseCode, refreshFlag }: Props) {
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

    return (
        <div className="space-y-4 mt-8">
            <h2 className="text-xl font-semibold">Student Ratings & Comments</h2>
            {ratings.map((r) => (
                <div key={r.id} className="border rounded p-4 shadow-sm bg-white">
                    <p><strong>Difficulty:</strong> {r.difficulty}/5</p>
                    <p><strong>Teaching Quality:</strong> {r.quality}/5</p>
                    <p><strong>Enjoyment:</strong> {r.enjoyment}/5</p>
                    {r.comment && (
                        <p className="mt-2 italic text-muted-foreground">“{r.comment}”</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">Posted on {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
            ))}
        </div>
    );
}
