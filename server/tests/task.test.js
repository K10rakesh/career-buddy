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
            .set("Authorization", "Bearer invalid-token");

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("Invalid or expired token.");
    });

    test("allows access with a valid JWT", async () => {
        const {token} = await createTestUser({
            email: "task-user@example.com"
        });

        const response = await request(app)
            .get("/api/tasks")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.tasks).toBeDefined();
        expect(Array.isArray(response.body.tasks)).toBe(true);
    });

    test("creates a task for an authenticated user", async () => {
        const {token} = await createTestUser({
            email: "create-task@example.com"
        });

        const response = await request(app)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${token}`)
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
        const {token} = await createTestUser({
            email: "get-tasks@example.com"
        });

        await request(app)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "First task",
                description: "First description"
            });

        await request(app)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Second task",
                description: "Second description"
            });

        const response = await request(app)
            .get("/api/tasks")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.tasks).toHaveLength(2);
        expect(response.body.tasks[0].title).toBe("First task");
        expect(response.body.tasks[1].title).toBe("Second task");
    });

    test("retrieves a specific task belonging to the authenticated user", async () => {
        const {token} = await createTestUser({
            email: "single-task@example.com"
        });

        const createResponse = await request(app)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Find this task",
                description: "Testing GET by ID"
            });

        const taskId = createResponse.body._id;

        const response = await request(app)
            .get(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.task._id).toBe(taskId);
        expect(response.body.task.title).toBe("Find this task");
    });

    test("updates a task belonging to the authenticated user", async () => {
        const {token} = await createTestUser({
            email: "update-task@example.com"
        });

        const createResponse = await request(app)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Old title",
                description: "Old description"
            });

        const taskId = createResponse.body._id;

        const response = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
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
        const {token} = await createTestUser({
            email: "delete-task@example.com"
        });

        const createResponse = await request(app)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Task to delete",
                description: "This should be deleted"
            });

        const taskId = createResponse.body._id;

        const deleteResponse = await request(app)
            .delete(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(deleteResponse.statusCode).toBe(200);
        expect(deleteResponse.body.message).toBe("Task successfully deleted.");

        const getResponse = await request(app)
            .get(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(getResponse.statusCode).toBe(404);
        expect(getResponse.body.message).toBe("Task not found.");
    });

    test("prevents a user from accessing another user's task", async () => {
        const {token: tokenA} = await createTestUser({
            name: "User A",
            email: "user-a@example.com"
        });

        const {token: tokenB} = await createTestUser({
            name: "User B",
            email: "user-b@example.com"
        });

        const createResponse = await request(app)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${tokenB}`)
            .send({
                title: "User B's private task",
                description: "Only User B should access this"
            });

        const taskId = createResponse.body._id;

        const response = await request(app)
            .get(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${tokenA}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Task not found.");
    });

    test("prevents a user from updating another user's task", async () => {
        const {token: tokenA} = await createTestUser({
            name: "User A",
            email: "update-a@example.com"
        });

        const {token: tokenB} = await createTestUser({
            name: "User B",
            email: "update-b@example.com"
        });

        const createResponse = await request(app)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${tokenB}`)
            .send({
                title: "Original title"
            });

        const taskId = createResponse.body._id;

        const response = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${tokenA}`)
            .send({
                title: "Hacked title"
            });

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Task not found.");

        const verifyResponse = await request(app)
            .get(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${tokenB}`);

        expect(verifyResponse.statusCode).toBe(200);
        expect(verifyResponse.body.task.title).toBe("Original title");
    });

    test("prevents a user from deleting another user's task", async () => {
        const {token: tokenA} = await createTestUser({
            name: "User A",
            email: "delete-a@example.com"
        });

        const {token: tokenB} = await createTestUser({
            name: "User B",
            email: "delete-b@example.com"
        });

        const createResponse = await request(app)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${tokenB}`)
            .send({
                title: "User B's task"
            });

        const taskId = createResponse.body._id;

        const response = await request(app)
            .delete(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${tokenA}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Task not found.");

        const verifyResponse = await request(app)
            .get(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${tokenB}`);

        expect(verifyResponse.statusCode).toBe(200);
        expect(verifyResponse.body.task.title).toBe("User B's task");
    });

    test("rejects an invalid task ID", async () => {
        const {token} = await createTestUser({
            email: "invalid-id@example.com"
        });

        const response = await request(app)
            .get("/api/tasks/not-a-valid-id")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Invalid task ID.");
    });

    test("rejects task creation without a title", async () => {
        const {token} = await createTestUser({
            email: "invalid-task@example.com"
        });

        const response = await request(app)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${token}`)
            .send({
                description: "Task without a title"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeDefined();
    });

    test("rejects task creation with an unexpected field", async () => {
        const {token} = await createTestUser({
            email: "unexpected-task@example.com"
        });

        const response = await request(app)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Valid title",
                admin: true
            });

        expect(response.statusCode).toBe(400);
    });

    test("rejects an empty task update", async () => {
        const {token} = await createTestUser({
            email: "empty-update@example.com"
        });

        const createResponse = await request(app)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Existing task"
            });

        const taskId = createResponse.body._id;

        const response = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeDefined();
    });
});