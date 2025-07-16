import {NextApiRequest, NextApiResponse} from "next";
import {Authenticator} from "@/services/authenticator";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const app_home_url = process.env.APP_HOME_URL || '/'

    try {
        // Clear any cookies or session-related info here if needed
        const auth = await Authenticator.init(req, res, req.query  as Record<string, string | undefined>);
        const result = await auth.invalidate_user();
        console.log(result);
        // Redirect to home
        res.writeHead(302, {
            Location: app_home_url,
        })
        res.end()
    } catch (err) {
        console.error("Logout error:", err)
        if (!res.headersSent) {
            res.status(500).json({ error: 'Logout failed' })
        }
    }
}