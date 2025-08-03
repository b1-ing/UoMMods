"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import Link from "next/link";
import { Star } from "lucide-react";

type Props = {
    courseCode: string;
    onRatingSubmitted?: () => void;
};

export type AuthData = {
    authenticated: boolean;
    username: string | null;
    fullname: string | null;
};

type Payload = {
    course_code: string,
    difficulty: number,
    quality: number,
    enjoyment: number,
    comment: string,
    created_at:string,
    fullname:string,
    username :string,
};

export default function RatingForm({ courseCode, onRatingSubmitted }: Props) {
    const [difficulty, setDifficulty] = useState(3);
    const [quality, setQuality] = useState(3);
    const [enjoyment, setEnjoyment] = useState(3);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
    const [fullname, setFullname] = useState<string | null>(null);
    const [auth, setAuthentication] = useState<AuthData>({
        authenticated: false,
        username: null,
        fullname: null,
    });
    const [redirectUrl, setRedirectUrl] = useState<string>("");
    const [anonymous, setAnonymous] = useState<boolean>(false);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await fetch("/api/session",{
                    credentials: "include",
                });
                const data = await res.json();
                if (data.auth) {
                    setAuthentication({
                        authenticated: true,
                        username: data.user.username ?? null,
                        fullname: data.user.fullname ?? null,
                    });
                    setUsername(data.user.username ?? null);
                    setFullname(data.user.fullname ?? null);
                } else {
                    setAuthentication({
                        authenticated: false,
                        username: null,
                        fullname: null,
                    });
                }
            } catch (e) {
                console.error("Failed to fetch session", e);
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, []);



    useEffect(() => {
        if (typeof window !== "undefined") {
            setRedirectUrl(encodeURIComponent(window.location.href));
        }
    }, []);

    const decodedName = useMemo(() => {
        return fullname ? decodeURIComponent(fullname) : "";
    }, [fullname]);

    async function handleSubmit() {
        setLoading(true);

        const payload: Payload = {
            course_code: courseCode,
            difficulty,
            quality,
            enjoyment,
            comment,
            created_at: new Date().toISOString(),
            fullname: "Anonymous",
            username: "anonymous",
        };

        if (!anonymous && fullname && username) {
            payload.fullname = fullname;
            payload.username = username;
        }

        const { error } = await supabase.from('ratings').insert([payload]);
        setLoading(false);

        if (!error) {
            toast('Rating submitted! Thanks!');
            setDifficulty(3);
            setQuality(3);
            setEnjoyment(3);
            setComment('');
            setAnonymous(false);
            onRatingSubmitted?.();
        } else {
            toast('Error submitting rating');
        }
    }

    return (
        <div className="mt-6 p-6 border rounded-md shadow-sm space-y-4">
            {loading ? (
                <p>🔄 Checking login status...</p>
            ) : !auth.authenticated ? (
                <Link
                    href={`/login?redirect=${redirectUrl}`}
                    className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
                >
                    Log in to rate
                </Link>
            ) : (
                <>
                    <h2 className="text-xl font-semibold">Rate this Course</h2>
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-600 mb-1">
                            {anonymous
                                ? 'Posting anonymously'
                                : `Posting as ${decodedName}`}
                        </p>
                        <label className="inline-flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={anonymous}
                                onChange={(e) => setAnonymous(e.target.checked)}
                                className="form-checkbox"
                            />
                            <span>Anonymous</span>
                        </label>
                    </div>


                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left: Sliders */}
                        <div className="flex-1 space-y-6">
                            <RatingSlider label="Difficulty" value={difficulty} onChange={setDifficulty} />
                            <RatingSlider label="Teaching Quality" value={quality} onChange={setQuality} />
                            <RatingSlider label="Enjoyment" value={enjoyment} onChange={setEnjoyment} />
                        </div>

                        {/* Divider */}
                        <div className="hidden md:block w-px bg-gray-300" />

                        {/* Right: Comment box */}
                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="comment">Comments</Label>
                                <Textarea
                                    id="comment"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Any specific thoughts?"
                                    className="min-h-[120px]"
                                />
                            </div>
                            <Button onClick={handleSubmit} disabled={loading} className="w-full">
                                {loading ? 'Submitting...' : 'Submit Rating'}
                            </Button>
                        </div>
                    </div>
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
        <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{label}</Label>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                    <button
                        key={v}
                        onClick={() => onChange(v)}
                        className="text-yellow-500 hover:scale-110 transition-transform"
                    >
                        <Star
                            size={20}
                            fill={v <= value ? "currentColor" : "none"}
                            stroke="currentColor"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
