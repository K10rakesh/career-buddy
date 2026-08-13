const request = require("supertest");
const app = require("../src/app");

describe("POST /api/auth/register", () => {
    test("registers a new user successfully", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "test@example.com",
                password: "password123"
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("User registered successfully.");
        expect(response.body.user).toBeDefined();
        expect(response.body.user.name).toBe("Test User");
        expect(response.body.user.email).toBe("test@example.com");
        expect(response.body.user.password).toBeUndefined();
    });

    test("rejects registration when email is already registered", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                name: "First User",
                email: "duplicate@example.com",
                password: "password123"
            });

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Second User",
                email: "duplicate@example.com",
                password: "password456"
            });

        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe("Email already registered.");
    }); 

    test("rejects registration with invalid email", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "not-an-email",
                password: "password123"
            });

        expect(response.statusCode).toBe(400);
    });

    test("rejects registration with a short password", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "test@example.com",
                password: "short"
            });

        expect(response.statusCode).toBe(400);
    });

    test("rejects registration with an unexpected field", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
                role: "admin"
            });

        expect(response.statusCode).toBe(400);
    });

    test("logs in an existing user successfully", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "login@example.com",
                password: "password123"
            });

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "login@example.com",
                password: "password123"
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Login successful.");
        expect(response.body.token).toBeDefined();
        expect(typeof response.body.token).toBe("string");

        expect(response.body.user).toBeDefined();
        expect(response.body.user.email).toBe("login@example.com");
        expect(response.body.user.password).toBeUndefined();
    });

    test("rejects login with an incorrect password", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "wrong-password@example.com",
                password: "password123"
            });

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "wrong-password@example.com",
                password: "wrongpassword"
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("Invalid email or password.");
    });

    test("rejects login with an unknown email", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "doesnotexist@example.com",
                password: "password123"
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("Invalid email or password.");
});
});

