import database from "infra/database.js";
import { ServiceError } from "infra/errors";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";

const defaultMigrationOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  log: () => {},
  migrationsTable: "pgmigrations",
};

async function listPendingMigrations() {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    return await migrationRunner({
      ...defaultMigrationOptions,
      dbClient: dbClient,
    });
  } catch (error) {
    throw new ServiceError({
      message: "Erro ao listar as migrações pendentes",
      cause: error,
    });
  } finally {
    dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    return await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
      dbClient: dbClient,
    });
  } catch (error) {
    throw new ServiceError({
      message: "Erro ao executar as migrações pendentes",
      cause: error,
    });
  } finally {
    dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
