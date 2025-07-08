import { NextApiRequest, NextApiResponse } from 'next';
import {Authenticator} from "@/services/authenticator";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log(req.query)
    let redirectRaw = req.query.redirect;
    const redirectUrl = Array.isArray(redirectRaw)
        ? redirectRaw[0] // take the first if duplicated
        : (typeof redirectRaw === "string" ? redirectRaw : process.env.APP_HOME_URL!);

    console.log("Redirecting to:", redirectUrl);
    const auth = await Authenticator.init(req, res, req.query as Record<string, string>);
    const result = await auth.validate_user(redirectUrl);
    res.status(200).json(result);
    console.log(result)
}