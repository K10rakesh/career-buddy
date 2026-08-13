const request = require("supertest");
const express = require("express");
const rateLimit = require("express-rate-limit");

describe("Rate limiting", () => {
    test("rejects requests after the configured limit", async () => {
        const app = express();

        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            limit: 2,
            handler: (req, res) => {
                res.status(429).json({
                    message: "Too many requests. Please try again later."
                });
            }
        });

        app.use(limiter);

        app.get("/test", (req, res) => {
            res.status(200).json({
                message: "Request successful."
            });
        });

        const firstResponse = await request(app)
            .get("/test");

        const secondResponse = await request(app)
            .get("/test");

        const thirdResponse = await request(app)
            .get("/test");

        expect(firstResponse.statusCode).toBe(200);
        expect(secondResponse.statusCode).toBe(200);
        expect(thirdResponse.statusCode).toBe(429);
        expect(thirdResponse.body.message).toBe(
            "Too many requests. Please try again later."
        );
    });
});