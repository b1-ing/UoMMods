// app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {AuthData} from "@/app/components/RatingForm";
export default function LoginPage() {
    const [auth, setAuthentication] = useState<AuthData>({
        authenticated: false,
        username: null,
        fullname: null,
    });
    const searchParams = useSearchParams();
    const redirectUrl = searchParams?.get("redirect");



    useEffect(() => {
        const authAPI = async () => {

            try {
                const searchParams = new URLSearchParams(window.location.search);
                console.log("client side redirect" , redirectUrl)
                // const search = window.location.search; // safe to use inside useEffect
                const queryString = searchParams.toString();
                const response = await fetch(`/api/login?redirect=${encodeURIComponent(redirectUrl)}${queryString ? `&${queryString}` : ''}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Credentials": "true",
                    },
                    mode: "cors",
                    credentials: "include",
                });

                const data = await response.json();

                if (!data.auth) {
                    console.log("fail")
                    window.location.href = data.url; // Redirect if not authenticated
                } else {
                    console.log("pass")
                    setAuthentication({
                        authenticated: true,
                        username: data.username,
                        fullname: data.fullname,
                    });
                    window.location.replace(data.url);
                }
            } catch (error) {
                console.error("An error occurred during authentication:", error);

            }
        };

        authAPI();
    }, []);

    return <p>Redirecting to login...</p>;
}

