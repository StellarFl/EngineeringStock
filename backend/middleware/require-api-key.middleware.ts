import crypto from "crypto";
import { NextFunction, Request, Response } from "express"
import { API_KEY } from "../config/env";

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
    const key = req.header("x-api-key");

    if (!key) {
        return res.status(401).json({ error: "Missing API key" });
    }

    const expected = Buffer.from(API_KEY);
    const received = Buffer.from(key);

    const isValid =
        expected.length === received.length &&
        crypto.timingSafeEqual(expected, received);

    if (!isValid) {
        return res.status(401).json({ error: "Invalid API key" });
    }

    next();
}