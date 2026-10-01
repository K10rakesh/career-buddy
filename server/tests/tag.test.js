const request = require("supertest");
const app = require("../src/app");
const {createTestUser} = require("./helpers/auth");

describe("Protected tag routes", () => {
    test("rejects request without authentication", async () => {
        const response = await request(app)
            .get("/api/tags");

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("Authentication required.");
    });

    test("creates a tag for an authenticated user", async () => {
        const agent = request.agent(app);

        await createTestUser({
            email: "create-tag@example.com"
        });

        await agent
            .post("/api/auth/login")
            .send({
                email: "create-tag@example.com",
                password: "password123"
            });

        const response = await agent
            .post("/api/tags")
            .send({
                name: "Programming"
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.tag).toBeDefined();
        expect(response.body.tag.name).toBe("Programming");
        expect(response.body.tag.id).toBeDefined();
    });

    test("rejects creation of a duplicate tag name", async () => {
        const agent = request.agent(app);

        await createTestUser({
            email: "duplicate-tag@example.com"
        });

        await agent
            .post("/api/auth/login")
            .send({
                email: "duplicate-tag@example.com",
                password: "password123"
            });

        await agent
            .post("/api/tags")
            .send({
                name: "Programming"
            });

        const response = await agent
            .post("/api/tags")
            .send({
                name: "Programming"
            });

        expect(response.statusCode).toBe(409);
    });

    test("rejects creation of a tag with an empty name", async () => {
        const agent = request.agent(app);

        await createTestUser({
            email: "empty-tag@example.com"
        });

        await agent
            .post("/api/auth/login")
            .send({
                email: "empty-tag@example.com",
                password: "password123"
            });

        const response = await agent
            .post("/api/tags")
            .send({
                name: ""
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeDefined();
    });

    test("rejects creation of a tag with an unexpected field", async () => {
        const agent = request.agent(app);

        await createTestUser({
            email: "unexpected-tag@example.com"
        });

        await agent
            .post("/api/auth/login")
            .send({
                email: "unexpected-tag@example.com",
                password: "password123"
            });

        const response = await agent
            .post("/api/tags")
            .send({
                name: "Programming",
                color: "red"
            });

        expect(response.statusCode).toBe(400);
    });

    test("retrieves tags belonging to the authenticated user", async () => {
        const agent = request.agent(app);

        await createTestUser({
            email: "get-tags@example.com"
        });

        await agent
            .post("/api/auth/login")
            .send({
                email: "get-tags@example.com",
                password: "password123"
            });

        await agent
            .post("/api/tags")
            .send({
                name: "Programming"
            });

        await agent
            .post("/api/tags")
            .send({
                name: "College"
            });

        const response = await agent
            .get("/api/tags");

        expect(response.statusCode).toBe(200);
        expect(response.body.tags).toBeDefined();

        const tagNames = response.body.tags.map((tag) => tag.name);

        expect(tagNames).toEqual([
            "College",
            "Health",
            "Personal",
            "Programming",
            "Study",
            "Work"
        ]);
    });

    test("updates a tag belonging to the authenticated user", async () => {
        const agent = request.agent(app);

        await createTestUser({
            email: "update-tag@example.com"
        });

        await agent
            .post("/api/auth/login")
            .send({
                email: "update-tag@example.com",
                password: "password123"
            });

        const createResponse = await agent
            .post("/api/tags")
            .send({
                name: "Programming"
            });

        const tagId = createResponse.body.tag.id;

        const response = await agent
            .patch(`/api/tags/${tagId}`)
            .send({
                name: "Development"
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.tag).toBeDefined();
        expect(response.body.tag.id).toBe(tagId);
        expect(response.body.tag.name).toBe("Development");
    });

    test("rejects updating a tag to a duplicate name", async () => {
        const agent = request.agent(app);

        await createTestUser({
            email: "duplicate-update-tag@example.com"
        });

        await agent
            .post("/api/auth/login")
            .send({
                email: "duplicate-update-tag@example.com",
                password: "password123"
            });

        await agent
            .post("/api/tags")
            .send({
                name: "Programming"
            });

        const secondTagResponse = await agent
            .post("/api/tags")
            .send({
                name: "College"
            });

        const secondTagId = secondTagResponse.body.tag.id;

        const response = await agent
            .patch(`/api/tags/${secondTagId}`)
            .send({
                name: "Programming"
            });

        expect(response.statusCode).toBe(409);
    });

    test("rejects updating a tag with an empty name", async () => {
        const agent = request.agent(app);

        await createTestUser({
            email: "empty-update-tag@example.com"
        });

        await agent
            .post("/api/auth/login")
            .send({
                email: "empty-update-tag@example.com",
                password: "password123"
            });

        const createResponse = await agent
            .post("/api/tags")
            .send({
                name: "Programming"
            });

        const tagId = createResponse.body.tag.id;

        const response = await agent
            .patch(`/api/tags/${tagId}`)
            .send({
                name: ""
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeDefined();
    });

    test("deletes a tag belonging to the authenticated user", async () => {
        const agent = request.agent(app);

        await createTestUser({
            email: "delete-tag@example.com"
        });

        await agent
            .post("/api/auth/login")
            .send({
                email: "delete-tag@example.com",
                password: "password123"
            });

        const createResponse = await agent
            .post("/api/tags")
            .send({
                name: "Programming"
            });

        const tagId = createResponse.body.tag.id;

        const deleteResponse = await agent
            .delete(`/api/tags/${tagId}`);

        expect(deleteResponse.statusCode).toBe(200);
        expect(deleteResponse.body.message).toBe("Tag successfully deleted.");

        const getResponse = await agent
            .get("/api/tags");

        expect(getResponse.statusCode).toBe(200);

        const tagNames = getResponse.body.tags.map((tag) => tag.name);

        expect(tagNames).not.toContain("Programming");
        expect(tagNames).toEqual([
            "Health",
            "Personal",
            "Study",
            "Work"
        ]);
    });

    test("prevents a user from updating another user's tag", async () => {
        const agentA = request.agent(app);
        const agentB = request.agent(app);

        await createTestUser({
            name: "User A",
            email: "tag-update-a@example.com"
        });

        await createTestUser({
            name: "User B",
            email: "tag-update-b@example.com"
        });

        await agentA
            .post("/api/auth/login")
            .send({
                email: "tag-update-a@example.com",
                password: "password123"
            });

        await agentB
            .post("/api/auth/login")
            .send({
                email: "tag-update-b@example.com",
                password: "password123"
            });

        const createResponse = await agentB
            .post("/api/tags")
            .send({
                name: "Private Tag"
            });

        const tagId = createResponse.body.tag.id;

        const response = await agentA
            .patch(`/api/tags/${tagId}`)
            .send({
                name: "Hacked Tag"
            });

        expect(response.statusCode).toBe(404);

        const verifyResponse = await agentB
            .get("/api/tags");

        expect(verifyResponse.statusCode).toBe(200);

        const tagNames = verifyResponse.body.tags.map((tag) => tag.name);

        expect(tagNames).toContain("Private Tag");
        expect(tagNames).not.toContain("Hacked Tag");
    });

    test("prevents a user from deleting another user's tag", async () => {
        const agentA = request.agent(app);
        const agentB = request.agent(app);

        await createTestUser({
            name: "User A",
            email: "tag-delete-a@example.com"
        });

        await createTestUser({
            name: "User B",
            email: "tag-delete-b@example.com"
        });

        await agentA
            .post("/api/auth/login")
            .send({
                email: "tag-delete-a@example.com",
                password: "password123"
            });

        await agentB
            .post("/api/auth/login")
            .send({
                email: "tag-delete-b@example.com",
                password: "password123"
            });

        const createResponse = await agentB
            .post("/api/tags")
            .send({
                name: "Private Tag"
            });

        const tagId = createResponse.body.tag.id;

        const response = await agentA
            .delete(`/api/tags/${tagId}`);

        expect(response.statusCode).toBe(404);

        const verifyResponse = await agentB
            .get("/api/tags");

        expect(verifyResponse.statusCode).toBe(200);

        const tagNames = verifyResponse.body.tags.map((tag) => tag.name);

        expect(tagNames).toContain("Private Tag");
    });

    test("rejects an invalid tag ID", async () => {
        const agent = request.agent(app);

        await createTestUser({
            email: "invalid-tag-id@example.com"
        });

        await agent
            .post("/api/auth/login")
            .send({
                email: "invalid-tag-id@example.com",
                password: "password123"
            });

        const response = await agent
            .patch("/api/tags/not-a-valid-id")
            .send({
                name: "Updated"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Invalid tag ID.");
    });
});