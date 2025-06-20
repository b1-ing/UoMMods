'use client'

import React, { useEffect, useState } from 'react';
import { sendForAuthentication, confirmAuthentication } from '@/lib/auth';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ticket = params.get('csticket');
        const username = params.get('username');
        const fullname = params.get('fullname');

        if (!ticket || !username || !fullname) {
            sendForAuthentication(window.location.href);
            return;
        }

        confirmAuthentication(ticket, username, fullname).then(success => {
            if (success) {
                localStorage.setItem('username', username);
                localStorage.setItem('fullname', fullname);
            } else {
                // Failed auth
                window.location.href = '/failed-auth';
            }
            setLoading(false);
        });
    }, []);

    if (loading) return <p>Authenticating...</p>;

    return <>{children}</>;
}
