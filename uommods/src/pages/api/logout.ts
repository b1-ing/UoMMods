import {NextApiRequest, NextApiResponse} from "next";
import {Authenticator} from "@/services/authenticator";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log(req.query)
    const auth = await Authenticator.init(req, res, req.query as Record<string, string>);
    const result = await auth.invalidate_user();
    res.status(200).json(result);
    console.log(result)
}