import {Session, getSessionData} from '@/lib/session';
import { IncomingMessage, ServerResponse } from 'http';
import { URLSearchParams } from 'url';



const AUTHENTICATION_SERVICE_URL = process.env.NEXT_PUBLIC_AUTHENTICATION_SERVICE_URL!;
const AUTHENTICATION_LOGOUT_URL = process.env.NEXT_PUBLIC_AUTHENTICATION_LOGOUT_URL!;
const APP_HOME_URL = process.env.NEXT_PUBLIC_APP_HOME_URL!;

export class Authenticator {
    req: IncomingMessage;
    res: ServerResponse;
    query: Record<string, string | undefined>;
    session: Session;

    constructor(
        req: IncomingMessage,
        res: ServerResponse,
        query: Record<string, string | undefined>,
        session: Session
    ) {
        this.req = req;
        this.res = res;
        this.query = query;
        this.session = session;
    }

    static async init(req: IncomingMessage, res: ServerResponse, query: Record<string, string | undefined>) {
        const session = await getSessionData(req, res);
        return new Authenticator(req, res, query, session);
    }
    is_authenticated(): boolean {
        const authTime = this.session.authenticated;
        return (
            typeof authTime === 'number' &&
            decodeURIComponent(this.session.username || '') === this.query.username &&
            decodeURIComponent(this.session.fullname || '') === this.query.fullname
        );
    }

    async validate_user(redirectUrl: string) {
        console.log (this.is_authenticated())
        console.log(redirectUrl)
        console.log(this.query.csticket)
        console.log("session:" + this.session.csticket)
        console.log(this.session.redirectUrl);
        const storedRedirect = this.session.redirectUrl;
        const finalRedirectUrl = (
            storedRedirect && storedRedirect !== "http://localhost:3000/login" && !storedRedirect
        ) ? storedRedirect : redirectUrl;
        this.session.redirectUrl = finalRedirectUrl;

        await this.session.save();
        console.log(finalRedirectUrl);

        if (this.is_authenticated()) {
            return this.auth_response(true, finalRedirectUrl);
        }
        if (!this.session.csticket || !this.query.csticket) {
            console.log("sending to auth 1")
            return this.send_for_authentication("http://localhost:3000/login");
        }
        if (this.query.csticket !== this.session.csticket) {
            console.log("sending to auth 2")
            return this.send_for_authentication("http://localhost:3000/login");
        }
        if (await this.match_server_auth(redirectUrl)) {
            console.log("chjecking")
            await this.record_authenticated_user();
            return this.auth_response(false, finalRedirectUrl);
        }
        return this.auth_response(true, finalRedirectUrl);
    }

    async send_for_authentication(redirectUrl: string) {
        const csticket = Date.now().toString(16);
        this.session.csticket = csticket;
        this.session.redirectUrl = redirectUrl;

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
            url: redirectUrl ?? APP_HOME_URL,
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