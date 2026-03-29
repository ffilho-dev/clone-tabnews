import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import session from "models/session.js";
import user from "models/user.js";
import authorization from "models/authorization.js";

const router = new createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest("read:session"), getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const sessionToken = request.cookies.sid;
  const userTryngToGet = request.context.user;

  const sessionObj = await session.findOneValidByToken(sessionToken);
  await session.renew(sessionObj.id);
  controller.setSessionCookie(sessionObj.token, response);

  const userFound = await user.findOneById(sessionObj.user_id);

  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );

  const secureOutputValues = authorization.filterOutput(
    userTryngToGet,
    "read:user:self",
    userFound,
  );
  return response.status(200).json(secureOutputValues);
}
