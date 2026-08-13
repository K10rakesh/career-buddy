const request = require("supertest");
const app = require("../../src/app");

const createTestUser = async ({
    name = "Test User",
    email = "test@example.com",
    password = "password123"
} = {}) => {
    await request(app)
        .post("/api/auth/register")
        .send({
            name,
            email,
            password
        });

    const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
            email,
            password
        });

    return {
        token: loginResponse.body.token,
        user: loginResponse.body.user
    };
};

module.exports = {createTestUser};