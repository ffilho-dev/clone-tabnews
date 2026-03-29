import database from "infra/database";
import webserver from "infra/webserver";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await database.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/migration", () => {
  describe("Anonymous user", () => {
    test("Running pending migrations", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        method: "POST",
      });
      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        action: 'Verifique se o usuário possui a feature "create:migration"',
        message: "Você não possui permissão para executar essa ação.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });
  });
  describe("Default user", () => {
    test("Running pending migrations", async () => {
      const user = await orchestrator.createUser();
      const userActivated = await orchestrator.activateUser(user);
      const userSession = await orchestrator.createSession(userActivated);

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        method: "POST",
        headers: {
          Cookie: `sid=${userSession.token}`,
        },
      });
      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        action: 'Verifique se o usuário possui a feature "create:migration"',
        message: "Você não possui permissão para executar essa ação.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });
  });
  describe("Privileged user", () => {
    test("Running pending migrations with `create:migration`", async () => {
      const user = await orchestrator.createUser();
      const userActivated = await orchestrator.activateUser(user);
      await orchestrator.addFeaturesToUser(user, ["create:migration"]);
      const session = await orchestrator.createSession(userActivated);

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        method: "POST",
        headers: {
          Cookie: `sid=${session.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(Array.isArray(responseBody)).toBe(true);
    });
  });
});
