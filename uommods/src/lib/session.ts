import {getIronSession, IronSession} from 'iron-session';
import { IncomingMessage, ServerResponse } from 'http';




interface SessionData {
    username?: string;
    fullname?: string;
    authenticated?: number;
    csticket?: string;
    redirectUrl?: string;
}


export type Session = IronSession<SessionData>;
export const sessionOptions = {
    password: process.env.SESSION_PASSWORD!,
    cookieName: 'app-session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60, // 24 hours in seconds
    },
};



export async function getSessionData(
    req: IncomingMessage,
    res: ServerResponse
): Promise<Session> {
    return await getIronSession<SessionData>(req, res, sessionOptions);
}