import { NextApiRequest, NextApiResponse } from 'next';
import { Authenticator } from '@/services/authenticator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const query = req.query as Record<string, string | string[]>;
    const redirectRaw = query.redirect;

    // Clean up redirect value (array or string fallback)
    const redirectUrl = Array.isArray(redirectRaw)
        ? redirectRaw[0] // Use first if duplicated
        : (typeof redirectRaw === 'string' ? redirectRaw : process.env.APP_HOME_URL!);



    // Run auth logic via your Authenticator class
    const auth = await Authenticator.init(req, res, query  as Record<string, string | undefined>, undefined, redirectUrl);
    const result = await auth.validate_user(); // validate_user now fetches redirect from session

    console.log('🧭 Auth result:', result);
    res.status(200).json(result);
}
