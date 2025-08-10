"use client";

import { useEffect, useState } from "react";
import { AuthData } from "@/app/components/RatingForm";

export default function LoginPage() {
    const [auth, setAuthentication] = useState<AuthData>({
        authenticated: false,
        username: null,
        fullname: null,
    });

    const authAPI = async () => {
        try {
            const allParams = new URLSearchParams(window.location.search);

            // Extract and remove redirect param
            const redirectUrl = allParams.get("redirect") ?? "/";
            allParams.delete("redirect");

            // Remaining params (like csticket, username, fullname)
            const remaining = allParams.toString();

            // Final API request URL
            const loginUrl = `/api/login?redirect=${encodeURIComponent(
                redirectUrl
            )}${remaining ? `&${remaining}` : ""}`;

            const response = await fetch(loginUrl, {
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
                console.log("🔐 Not authenticated, redirecting to:", data.url);
                window.location.href = data.url;
            } else {
                console.log("✅ Authenticated! Redirecting to:", data.url);
                setAuthentication({
                    authenticated: true,
                    username: data.username,
                    fullname: data.fullname,
                });

                window.location.replace(data.url); // Go back to original page
            }
        } catch (error) {
            console.error("❌ Auth error:", error);
        }
    };

    useEffect(() => {
        authAPI();
    }, []);

    return (
        <div>
            {auth.authenticated ? (
                <p>Welcome, {auth.fullname}!</p>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}
