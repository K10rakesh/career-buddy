const request = require("supertest");
const app = require("../src/app");
const {createTestUser} = require("./helpers/auth");

describe("Protected task routes", () => {
    test("rejects request without authentication", async () => {
        const response = await request(app)
            .get("/api/tasks");

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("Authentication required.");
    });

    test("rejects request with an invalid token", async () => {
        const response = await request(app)
            .get("/api/tasks")
            .set("Cookie", "authToken=invalid-token");

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("Invalid or expired token.");
    });

    test("allows access with a valid JWT", async () => {
        const agent = request.agent(app);

        await createTestUser({
            email: "task-user@example.com"
        });

        await agent
            .post("/api/auth/login")
            .send({
                email: "task-user@example.com",
                password: "password123"
            });

        const response = await agent
            .get("/api/tasks");

        expect(response.statusCode).toBe(200);
        expect(response.body.tasks).toBeDefined();
        expect(Array.isArray(response.body.tasks)).toBe(true);
    });

    test("creates a task for an authenticated user", async () => {
        const agent = request.agent(app);

        await createTestUser({
            email: "create-task@example.com"
        });

        await agent
            .post("/api/auth/login")
            .send({
                email: "create-task@example.com",
                password: "password123"
            });

        const response = await agent
            .post("/api/tasks")
            .send({
                title: "Learn API testing",
                description: "Write automated integration tests"
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe("Learn API testing");
        expect(response.body.description).toBe("Write automated integration tests");
        expect(response.body.completed).toBe(false);
    });

    test("retrieves tasks belonging to the authenticated user", async () => {
        const agent = request.agent(app);

        await createTestUser({
            email: "get-tasks@example.com"
        });

        await agent
            .post("/api/auth/login")
            .send({
                email: "get-tasks@example.com",
                password: "password123"
            });

        await agent
            .post("/api/tasks")
            .send({
                title: "First task",
                description: "First description"
            });

        await agent
            .post("/api/tasks")
            .send({
                title: "Second task",
                description: "Second description"
            });

        const response = await agent
            .get("/api/tasks");

        expect(response.statusCode).toBe(200);
        expect(response.body.tasks).toHaveLength(2);
        expect(response.body.tasks[0].title).toBe("First task");
        expect(response.body.tasks[1].title).toBe("Second task");
    });

    test("retrieves a specific task belonging to the authenticated user", async () => {
        const agent = request.agent(app);

        await createTestUser({
            email: "single-task@example.com"
        });

        await agent
            .post("/api/auth/login")
            .send({
                email: "single-task@example.com",
                password: "password123"
            });

        const createResponse = await agent
            .post("/api/tasks")
            .send({
                title: "Find this task",
                description: "Testing GET by ID"
            });

        const taskId = createResponse.body._id;

        const response = await agent
            .get(`/api/tasks/${taskId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.task._id).toBe(taskId);
        expect(response.body.task.title).toBe("Find this task");
    });

    test("updates a task belonging to the authenticated user", async () => {
        const agent = request.agent(app);

        await createTestUser({
            email: "update-task@example.com"
        });

        await agent
            .post("/api/auth/login")
            .send({
                email: "update-task@example.com",
                password: "password123"
            });

        const createResponse = await agent
            .post("/api/tasks")
            .send({
                title: "Old title",
                description: "Old description"
            });

        const taskId = createResponse.body._id;

        const response = await agent
            .patch(`/api/tasks/${taskId}`)
            .send({
                title: "Updated title",
                completed: true
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Task updated successfully.");
        expect(response.body.task.title).toBe("Updated title");
        expect(response.body.task.description).toBe("Old description");
        expect(response.body.task.completed).toBe(true);
    });

    test("deletes a task belonging to the authenticated user", async () => {
        const agent = request.agent(app);

        await createTestUser({
            email: "delete-task@example.com"
        });

        await agent
            .post("/api/auth/login")
            .send({
                email: "delete-task@example.com",
                password: "password123"
            });

        const createResponse = await agent
            .post("/api/tasks")
            .send({
                title: "Task to delete",
                description: "This should be deleted"
            });

        const taskId = createResponse.body._id;

        const deleteResponse = await agent
            .delete(`/api/tasks/${taskId}`);

        expect(deleteResponse.statusCode).toBe(200);
        expect(deleteResponse.body.message).toBe("Task successfully deleted.");

        const getResponse = await agent
            .get(`/api/tasks/${taskId}`);

        expect(getResponse.statusCode).toBe(404);
        expect(getResponse.body.message).toBe("Task not found.");
    });

    test("prevents a user from accessing another user's task", async () => {
        const agentA = request.agent(app);
        const agentB = request.agent(app);

        await createTestUser({
            name: "User A",
            email: "user-a@example.com"
        });

        await createTestUser({
            name: "User B",
            email: "user-b@example.com"
        });

        await agentA
            .post("/api/auth/login")
            .send({
                email: "user-a@example.com",
                password: "password123"
            });

        await agentB
            .post("/api/auth/login")
            .send({
                email: "user-b@example.com",
                password: "password123"
            });

        const createResponse = await agentB
            .post("/api/tasks")
            .send({
                title: "User B's private task",
                description: "Only User B should access this"
            });

        const taskId = createResponse.body._id;

        const response = await agentA
            .get(`/api/tasks/${taskId}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Task not found.");
    });

    test("prevents a user from updating another user's task", async () => {
        const agentA = request.agent(app);
        const agentB = request.agent(app);

        await createTestUser({
            name: "User A",
            email: "update-a@example.com"
        });

        await createTestUser({
            name: "User B",
            email: "update-b@example.com"
        });

        await agentA
            .post("/api/auth/login")
            .send({
                email: "update-a@example.com",
                password: "password123"
            });

        await agentB
            .post("/api/auth/login")
            .send({
                email: "update-b@example.com",
                password: "password123"
            });

        const createResponse = await agentB
            .post("/api/tasks")
            .send({
                title: "Original title"
            });

        const taskId = createResponse.body._id;

        const response = await agentA
            .patch(`/api/tasks/${taskId}`)
            .send({
                title: "Hacked title"
            });

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Task not found.");

        const verifyResponse = await agentB
            .get(`/api/tasks/${taskId}`);

        expect(verifyResponse.statusCode).toBe(200);
        expect(verifyResponse.body.task.title).toBe("Original title");
    });

    test("prevents a user from deleting another user's task", async () => {
        const agentA = request.agent(app);
        const agentB = request.agent(app);

        await createTestUser({
            name: "User A",
            email: "delete-a@example.com"
        });

        await createTestUser({
            name: "User B",
            email: "delete-b@example.com"
        });

        await agentA
            .post("/api/auth/login")
            .send({
                email: "delete-a@example.com",
                password: "password123"
            });

        await agentB
            .post("/api/auth/login")
            .send({
                email: "delete-b@example.com",
                password: "password123"
            });

        const createResponse = await agentB
            .post("/api/tasks")
            .send({
                title: "User B's task"
            });

        const taskId = createResponse.body._id;

        const response = await agentA
            .delete(`/api/tasks/${taskId}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Task not found.");

        const verifyResponse = await agentB
            .get(`/api/tasks/${taskId}`);

        expect(verifyResponse.statusCode).toBe(200);
        expect(verifyResponse.body.task.title).toBe("User B's task");
    });

    test("rejects an invalid task ID", async () => {
        const agent = request.agent(app);

        await createTestUser({
            email: "invalid-id@example.com"
        });

        await agent
            .post("/api/auth/login")
            .send({
                email: "invalid-id@example.com",
                password: "password123"
            });

        const response = await agent
            .get("/api/tasks/not-a-valid-id");

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Invalid task ID.");
    });

    test("rejects task creation without a title", async () => {
        const agent = request.agent(app);

        await createTestUser({
            email: "invalid-task@example.com"
        });

        await agent
            .post("/api/auth/login")
            .send({
                email: "invalid-task@example.com",
                password: "password123"
            });

        const response = await agent
            .post("/api/tasks")
            .send({
                description: "Task without a title"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeDefined();
    });

    test("rejects task creation with an unexpected field", async () => {
        const agent = request.agent(app);

        await createTestUser({
            email: "unexpected-task@example.com"
        });

        await agent
            .post("/api/auth/login")
            .send({
                email: "unexpected-task@example.com",
                password: "password123"
            });

        const response = await agent
            .post("/api/tasks")
            .send({
                title: "Valid title",
                admin: true
            });

        expect(response.statusCode).toBe(400);
    });

    test("rejects an empty task update", async () => {
        const agent = request.agent(app);

        await createTestUser({
            email: "empty-update@example.com"
        });

        await agent
            .post("/api/auth/login")
            .send({
                email: "empty-update@example.com",
                password: "password123"
            });

        const createResponse = await agent
            .post("/api/tasks")
            .send({
                title: "Existing task"
            });

        const taskId = createResponse.body._id;

        const response = await agent
            .patch(`/api/tasks/${taskId}`)
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeDefined();
    });
});