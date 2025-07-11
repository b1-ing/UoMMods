// pages/api/session.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSessionData } from "@/lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSessionData(req, res);

    if (session.username) {
        res.status(200).json({
            auth: true,
            user: {
                username: session.username,
                fullname: session.fullname,
            },
        });
    } else {
        res.status(200).json({ auth: false, user: null });
    }
}
