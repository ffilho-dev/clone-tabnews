import { createRouter } from "next-connect";
import database from "infra/database.js";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import controller from "infra/controller";

const router = new createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const dbClient = await database.getNewClient();

  const defaultMigrationOptions = {
    dbClient: dbClient,
    dryRun: true,
    dir: resolve("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  const pendingMigrations = await migrationRunner(defaultMigrationOptions);
  dbClient.end();

  return response.status(200).json(pendingMigrations);
}

async function postHandler(request, response) {
  const dbClient = await database.getNewClient();

  const defaultMigrationOptions = {
    dbClient: dbClient,
    dryRun: true,
    dir: resolve("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  const migratedMigrations = await migrationRunner({
    ...defaultMigrationOptions,
    dryRun: false,
  });

  dbClient.end();

  if (migratedMigrations.length > 0) {
    return response.status(201).json(migratedMigrations);
  }

  return response.status(200).json(migratedMigrations);
}
