import database from "infra/database";
import webserver from "infra/webserver";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await database.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET to /api/v1/migration", () => {
  describe("Anonymous user", () => {
    test("Retrieving pending migrations", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/migrations`);
      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        action: 'Verifique se o usuário possui a feature "read:migration"',
        message: "Você não possui permissão para executar essa ação.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });
  });
  describe("Default user", () => {
    test("Retrieving pending migrations", async () => {
      const user = await orchestrator.createUser();
      const userActivated = await orchestrator.activateUser(user);
      const session = await orchestrator.createSession(userActivated.id);

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        headers: { Cookie: `sid=${session.token}` },
      });
      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        action: 'Verifique se o usuário possui a feature "read:migration"',
        message: "Você não possui permissão para executar essa ação.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });
  });
  describe("Privileged user", () => {
    test("Retrieving pending migrations with `read:migration`", async () => {
      const user = await orchestrator.createUser();
      const userActivated = await orchestrator.activateUser(user);
      await orchestrator.addFeaturesToUser(user, ["read:migration"]);
      const session = await orchestrator.createSession(userActivated.id);

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        headers: { Cookie: `sid=${session.token}` },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(Array.isArray(responseBody)).toBe(true);
    });
  });
});
