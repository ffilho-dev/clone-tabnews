import webserver from "infra/webserver";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("GET to /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/status`);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      const parseUpdateAt = new Date(responseBody.update_at).toISOString();
      expect(responseBody.update_at).toEqual(parseUpdateAt);
      expect(responseBody.update_at).toBeDefined();
      expect(responseBody.dependencies.database.max_connections).toBeDefined();
      expect(responseBody.dependencies.database.max_connections).toEqual(100);
      expect(
        responseBody.dependencies.database.opened_connections,
      ).toBeDefined();
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
      expect(responseBody.dependencies.database).not.toHaveProperty("version");
    });
  });
  describe("Privileged user", () => {
    test("Retrieving current system status with `read:status:all`", async () => {
      const user = await orchestrator.createUser();
      const userActivated = await orchestrator.activateUser(user);
      await orchestrator.addFeaturesToUser(user, ["read:status:all"]);
      const session = await orchestrator.createSession(userActivated.id);

      const response = await fetch(`${webserver.origin}/api/v1/status`, {
        headers: {
          Cookie: `sid=${session.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      const parseUpdateAt = new Date(responseBody.update_at).toISOString();
      expect(responseBody.update_at).toEqual(parseUpdateAt);
      expect(responseBody.update_at).toBeDefined();
      expect(responseBody.dependencies.database.max_connections).toBeDefined();
      expect(responseBody.dependencies.database.max_connections).toEqual(100);
      expect(
        responseBody.dependencies.database.opened_connections,
      ).toBeDefined();
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
      expect(responseBody.dependencies.database.version).toBeDefined();
      expect(responseBody.dependencies.database.version).toEqual("16.0");
    });
  });
});
