import database from "infra/database";
import email from "infra/email";
import webserver from "infra/webserver";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const newToken = await runInsertQuery(userId, expiresAt);

  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        VALUES
          ($1, $2)
        RETURNING
          *
      ;`,
      values: [userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function findOneByUserId(userId) {
  const newToken = await runSelectQuery(userId);
  return newToken;

  async function runSelectQuery(userId) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE
          user_id = $1
        LIMIT
          1
      ;`,
      values: [userId],
    });

    return results.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "Francisco Filho <contato@franciscofilhodev.com.br",
    to: user.email,
    subject: "Ative seu cadastro no sistema!",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro no sistema:

${webserver.origin}/cadastro/ativar/${activationToken.id}

Atenciosamente,
Francisco Filho`,
  });
}

const activation = {
  sendEmailToUser,
  create,
  findOneByUserId,
};

export default activation;
