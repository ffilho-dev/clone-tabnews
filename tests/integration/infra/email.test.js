import email from "infra/email";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.deleteAllEmail();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await email.send({
      from: "FranciscoFilhoDev <contato@franciscofilhodev.com.br>",
      to: "contato@curso.dev",
      subject: "Teste de assunto",
      text: "Teste de corpo.",
    });

    await email.send({
      from: "FranciscoFilhoDev <contato@franciscofilhodev.com.br>",
      to: "contato@curso.dev",
      subject: "Último email enviado",
      text: "Corpo do último email enviado.",
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail.sender).toBe("<contato@franciscofilhodev.com.br>");
    expect(lastEmail.recipients[0]).toBe("<contato@curso.dev>");
    expect(lastEmail.subject).toBe("Último email enviado");
    expect(lastEmail.text).toBe("Corpo do último email enviado.\r\n");
  });
});
