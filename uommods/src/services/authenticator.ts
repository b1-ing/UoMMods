import {Session, getSessionData} from '@/lib/session';
import { IncomingMessage, ServerResponse } from 'http';
import { URLSearchParams } from 'url';



const AUTHENTICATION_SERVICE_URL = process.env.AUTHENTICATION_SERVICE_URL!;
const AUTHENTICATION_LOGOUT_URL = process.env.AUTHENTICATION_LOGOUT_URL!;
const baseUrl = process.env.APP_HOME_URL!;


export class Authenticator {
    req: IncomingMessage;
    res: ServerResponse;
    query: Record<string, string | undefined>;
    session: Session ;
    redirectUrl: string | undefined;

    constructor(
        req: IncomingMessage,
        res: ServerResponse,
        query: Record<string, string | undefined>,
        session: Session,
        redirectUrl: string | undefined
    ) {
        this.req = req;
        this.res = res;
        this.query = query;
        this.session = session;
        this.redirectUrl = redirectUrl;
    }

    static async init(
        req: IncomingMessage,
        res: ServerResponse,
        query: Record<string, string | undefined>,
        session?: Session, // new optional param
        redirectUrl?: string | undefined
    ) {
        const finalSession = session ?? await getSessionData(req, res);
        return new Authenticator(req, res, query, finalSession, redirectUrl);
    }
    is_authenticated(): boolean {
        const authTime = this.session.authenticated;
        return (
            typeof authTime === 'number' &&
            decodeURIComponent(this.session.username || '') === this.query.username &&
            decodeURIComponent(this.session.fullname || '') === this.query.fullname
        );
    }

    async validate_user() {
        // Use stored redirect URL in session or fallback
        const storedRedirect = this.session.redirectUrl;
        const fallbackUrl = process.env.APP_HOME_URL!;
        console.log(storedRedirect)

        const finalRedirectUrl = (typeof storedRedirect === "string" && storedRedirect.trim() !== "" && storedRedirect !== "https://uommods.vercel.app")
            ? storedRedirect
            : fallbackUrl;

        console.log("🔐 Session CSTicket:", this.session.csticket);
        console.log("🌍 Final Redirect URL:", finalRedirectUrl);

        if (this.is_authenticated()) {
            // Return the stored redirect URL when authenticated
            return this.auth_response(true, finalRedirectUrl);
        }

        // Authentication logic if not authenticated ...
        if (!this.session.csticket || !this.query.csticket) {
            console.log("🚪 Not authenticated, sending to auth service (no ticket)");
            return this.send_for_authentication(`${baseUrl}/login`);
        }
        if (this.query.csticket !== this.session?.csticket) {
            console.log("🚪 Not authenticated, sending to auth service (ticket mismatch)");
            return this.send_for_authentication(`${baseUrl}/login`);
        }
        if (await this.match_server_auth(finalRedirectUrl)) {
            console.log("✔️ Authentication successful, recording user");
            await this.record_authenticated_user();
            return this.auth_response(false, `${baseUrl}/login`);
        }
        return this.auth_response(true, finalRedirectUrl);
    }
    async send_for_authentication(redirectUrl: string) {
        const csticket = Date.now().toString(16);
        this.session.csticket = csticket;

        await this.session.save();
        console.log(this.session.csticket)
        return {
            auth: false,
            url: this.build_auth_url('validate', redirectUrl),
            fullname: null,
            username: null,
        };
    }


    async record_authenticated_user() {
        this.session.authenticated = Date.now();
        this.session.username = encodeURIComponent(this.query.username || '');
        this.session.fullname = encodeURIComponent(this.query.fullname || '');
        await this.session.save();
        console.log("saved session:" + this.session);
    }

    build_auth_url(command: string, redirectUrl: string) {
        const csticket = this.session.csticket;
        const params = new URLSearchParams({
            url: redirectUrl ?? process.env.APP_HOME_URL,
            csticket: csticket || '',
            version: '3',
            command: command,
        });
        return `${AUTHENTICATION_SERVICE_URL}?${params.toString()}`;
    }

    async match_server_auth(redirectUrl: string): Promise<boolean> {
        try {
            const params = new URLSearchParams({
                url: redirectUrl,
                csticket: this.session.csticket || '',
                command: 'confirm',
                version: '3',
                username: this.query.username || '',
                fullname: this.query.fullname || '',
            });
            const fullUrl = `${AUTHENTICATION_SERVICE_URL}?${params.toString()}`;
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'text/plain',
                },
            });
            const text = await response.text();
            return text.trim() === 'true';
        } catch (err) {
            console.error('Authentication check failed:', err);
            return false;
        }
    }

    auth_response(auth: boolean, url: string) {
        return {
            auth,
            url,
            fullname: decodeURIComponent(this.session.fullname || ''),
            username: decodeURIComponent(this.session.username || ''),
        };
    }

    async invalidate_user() {
        this.session.destroy();
        return {
            auth: false,
            url: AUTHENTICATION_LOGOUT_URL,
            fullname: null,
            username: null,
        };
    }

    // Legacy methods for compatibility
    // async login(userData: { id: string; email: string; name: string }) {
    //     this.session.username = userData;
    //     this.session.isAuthenticated = true;
    //     await this.session.save();
    // }
    //
    // async logout() {
    //     this.session.destroy();
    //     this.res.writeHead(302, { Location: AUTHENTICATION_LOGOUT_URL });
    //     this.res.end();
    // }
    //
    // getUser() {
    //     return this.session.user || null;
    // }
    //
    // redirectToAuth(state?: string) {
    //     const params = new URLSearchParams({
    //         redirect_uri: APP_HOME_URL,
    //         ...(state && { state })
    //     });
    //
    //     const authUrl = `${AUTHENTICATION_SERVICE_URL}?${params.toString()}`;
    //     this.res.writeHead(302, { Location: authUrl });
    //     this.res.end();
    // }
}
