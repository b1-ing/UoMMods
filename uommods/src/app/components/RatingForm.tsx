"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from "sonner"
import Link from "next/link";

type Props = {
    courseCode: string;
    onRatingSubmitted?: () => void;
};
export type AuthData = {
    authenticated: boolean
    username: string | null | undefined
    fullname: string | null | undefined
}


export default function RatingForm({ courseCode, onRatingSubmitted }: Props) {
    const [difficulty, setDifficulty] = useState(3);
    const [quality, setQuality] = useState(3);
    const [enjoyment, setEnjoyment] = useState(3);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
    const [fullname, setFullname]= useState<string | null>(null);
    const [url, setUrl] = useState<string | "">("");
    const [auth, setAuthentication] = useState<AuthData>({
        authenticated: false,
        username: null,
        fullname: null,
    });
    const [redirectUrl, setRedirectUrl] = useState<string>("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setRedirectUrl(encodeURIComponent(window.location.href));
        }
    }, []);








    async function handleSubmit() {
        console.log(fullname)
        setLoading(true);
        console.log("Inserting rating:", {
            course_code: courseCode,
            difficulty,
            quality,
            enjoyment,
            comment,
            fullname,
            username,
        });
        const { error } = await supabase.from('ratings').insert([{
            course_code: courseCode,
            difficulty,
            quality,
            enjoyment,
            comment,
            fullname,
            username,
            created_at: new Date().toISOString(),
        }]);
        setLoading(false);

        if (!error) {
            toast('Rating submitted! Thanks!');
            setDifficulty(3);
            setQuality(3);
            setEnjoyment(3);
            setComment('');
            onRatingSubmitted?.(); // notify parent to refresh ratings
        } else {
            toast('Error submitting rating');
        }
    };

    return (
        <div className="space-y-4 mt-6 p-4 border rounded-md shadow-sm">
                <p>
                    {!loading && !auth.authenticated && (
                        <Link
                            href={`/login?redirect=${redirectUrl}`}
                            className="ml-2 inline-flex items-center px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
                        >
                            Log in
                        </Link>
                    )}
                </p>
            {auth.authenticated && (
                <>
                <h2 className="text-xl font-semibold">Rate this Course</h2>


                <RatingSlider label="Difficulty" value={difficulty} onChange={setDifficulty}/>
                <RatingSlider label="Teaching Quality" value={quality} onChange={setQuality}/>
                <RatingSlider label="Enjoyment" value={enjoyment} onChange={setEnjoyment}/>


                <div className="space-y-2">
                    <Label>Comments</Label>
                    <Textarea value={comment} onChange={(e) => {
                        setComment(e.target.value)
                    }}/>
                </div>

                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Rating'}
                </Button>
                </>
)}
            </div>

            );

            }

            function RatingSlider({
            label,
            value,
            onChange,
        }: {
            label: string;
            value: number;
            onChange: (v: number) => void;
        }) {
            return (
            <div className="space-y-1">
            <Label className="block">{label}: {value}</Label>
    <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((v) => (
            <Button
                key={v}
                type="button"
                className={`w-10 h-10 rounded border text-sm font-medium
              ${v === value
                            ? 'bg-black text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-100'}`}
                        onClick={() => onChange(v)}
                    >
                        {v}
                    </Button>
                ))}
            </div>
        </div>
    );

}
