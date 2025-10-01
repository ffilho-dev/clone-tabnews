import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";
import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("Default user", () => {
    test("With valid session", async () => {
      const createdUser = await orchestrator.createUser({
        username: "UserWithValidSessiont",
      });

      const sessionObj = await orchestrator.createSession(createdUser.id);
      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `sid=${sessionObj.token}`,
        },
      });

      expect(response.status).toBe(200);

      const cacheControl = response.headers.get("Cache-Control");
      expect(cacheControl).toBe(
        "no-store, no-cache, max-age=0, must-revalidate",
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "UserWithValidSessiont",
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        update_at: createdUser.update_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.update_at)).not.toBeNaN();

      const renewedSessionObj = await session.findOneValidByToken(
        sessionObj.token,
      );

      expect(renewedSessionObj.expires_at > sessionObj.expires_at).toEqual(
        true,
      );
      expect(renewedSessionObj.update_at > sessionObj.update_at).toEqual(true);

      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.sid).toEqual({
        name: "sid",
        value: sessionObj.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    test("With nonexistent session", async () => {
      const nonexistentToken =
        "0b04c76d783f973163ba13233a9211c59fd40de1b31f52e48ec42edf0fd0ff420b88bcc3279c699b1369e7c3a941797f";

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `sid=${nonexistentToken}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      });
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });

      const createdUser = await orchestrator.createUser({
        username: "UserWithExpiredSessiont",
      });

      const sessionObj = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `sid=${sessionObj.token}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      });
    });

    test("with a valid session close to expiring", async () => {
      const TWO_MINUTES_IN_MILLISECONDS = 1000 * 60 * 2;

      jest.useFakeTimers({
        now: new Date(
          Date.now() -
            session.EXPIRATION_IN_MILLISECONDS +
            TWO_MINUTES_IN_MILLISECONDS,
        ),
      });

      const createdUser = await orchestrator.createUser({
        username: "userCloseToExpireSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `sid=${sessionObject.token}`,
        },
      });

      jest.useRealTimers();

      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "userCloseToExpireSession",
        email: createdUser.email,
        created_at: createdUser.created_at.toISOString(),
        update_at: createdUser.update_at.toISOString(),
        password: createdUser.password,
      });

      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(renewedSessionObject.expires_at.getTime()).toBeGreaterThan(
        sessionObject.expires_at.getTime(),
      );
      expect(renewedSessionObject.update_at.getTime()).toBeGreaterThan(
        sessionObject.update_at.getTime(),
      );

      const parserSetCookie = setCookieParser(response, { map: true });

      expect(parserSetCookie.sid).toEqual({
        name: "sid",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        httpOnly: true,
        path: "/",
      });
    });
  });
});
