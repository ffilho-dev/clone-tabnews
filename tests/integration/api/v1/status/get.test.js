import webserver from "infra/webserver";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

test("GET to /api/v1/status shoud return 200", async () => {
  const response = await fetch(`${webserver.origin}/api/v1/status`);
  expect(response.status).toBe(200);
});

test("GET to /api/v1/status should return a valid updated_at", async () => {
  const response = await fetch(`${webserver.origin}/api/v1/status`);
  const responseBody = await response.json();
  const parseUpdateAt = new Date(responseBody.update_at).toISOString();

  expect(responseBody.update_at).toEqual(parseUpdateAt);
  expect(responseBody.update_at).toBeDefined();
});

test("GET /api/v1/status returns database info", async () => {
  const response = await fetch(`${webserver.origin}/api/v1/status`);
  const responseBody = await response.json();

  expect(responseBody.dependencies.database.version).toBeDefined();
  expect(responseBody.dependencies.database.version).toEqual("16.0");

  expect(responseBody.dependencies.database.max_connections).toBeDefined();
  expect(responseBody.dependencies.database.max_connections).toEqual(100);

  expect(responseBody.dependencies.database.opened_connections).toBeDefined();
  expect(responseBody.dependencies.database.opened_connections).toEqual(1);
});
