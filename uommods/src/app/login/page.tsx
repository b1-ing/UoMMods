"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthData } from "@/app/components/RatingForm";

export default function LoginPage() {
    const [auth, setAuthentication] = useState<AuthData>({
        authenticated: false,
        username: null,
        fullname: null,
        redirectUrl: null,
    });

    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const authAPI = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                console.log(urlParams.get("redirect"));

                const redirectParam = urlParams.get("redirect") ?? (auth.redirectUrl? auth.redirectUrl : "/");
                urlParams.delete("redirect");

                const querySuffix = urlParams.toString();
                const loginApiUrl = `/api/login?redirect=${encodeURIComponent(redirectParam)}${querySuffix ? `&${querySuffix}` : ""}`;

                const response = await fetch(loginApiUrl, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include", // ✅ Required for session cookies
                });

                const data = await response.json();

                if (!data.auth) {
                    console.log("🔐 Not authenticated, redirecting to:", data.url);
                    window.location.href = data.url;
                    return;
                }

                // ✅ Authentication success
                console.log("✅ Authenticated! Redirecting to:", redirectParam);
                setAuthentication({
                    authenticated: true,
                    username: data.username,
                    fullname: data.fullname,
                    redirectUrl: data.url,
                });

                router.replace(data.url); // use Next.js router for SPA-style transition
            } catch (err) {
                console.error("❌ Error during auth flow:", err);
            }
        };

        authAPI();
    }, [searchParams]);

    return <p>🔄 Redirecting to login...</p>;
}
