import { NextApiRequest, NextApiResponse } from 'next';
import { Authenticator } from '@/services/authenticator';
import { Session, getSessionData } from '@/lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const query = req.query as Record<string, string | string[]>;
    let redirectRaw = query.redirect;

    // Clean up redirect value (array or string fallback)
    const redirectUrl = Array.isArray(redirectRaw)
        ? redirectRaw[0] // Use first if duplicated
        : (typeof redirectRaw === 'string' ? redirectRaw : process.env.APP_HOME_URL!);

    const isValidRedirect = (url: any): url is string =>
        typeof url === 'string' &&
        url.trim() !== '' &&
        url !== 'null' &&
        url !== 'undefined' &&
        url !== 'http://localhost:3000/login';

    // Load session early to optionally store redirect


    // If this is the first auth call and we got a valid redirect, store it in session


    // Run auth logic via your Authenticator class
    const auth = await Authenticator.init(req, res, query!, null, redirectUrl!);
    const result = await auth.validate_user(); // validate_user now fetches redirect from session

    console.log('🧭 Auth result:', result);
    res.status(200).json(result);
}
