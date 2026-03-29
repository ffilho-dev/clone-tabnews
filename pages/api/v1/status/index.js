import { createRouter } from "next-connect";
import database from "infra/database";
import controller from "infra/controller";
import authorization from "models/authorization";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;
  const updateAt = new Date().toISOString();

  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;

  const databaseMaxConnectionsResult = await database.query(
    "SHOW max_connections;",
  );
  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResult.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseConnectionsActiveResult = await database.query({
    text: "select count(*) from pg_stat_activity where datname = $1;",
    values: [databaseName],
  });
  const databaseConnectionsActiveValue =
    databaseConnectionsActiveResult.rows[0].count;

  const statusObject = {
    update_at: updateAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: parseInt(databaseMaxConnectionsValue),
        opened_connections: parseInt(databaseConnectionsActiveValue),
      },
    },
  };

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:status",
    statusObject,
  );

  response.status(200).json(secureOutputValues);
}
