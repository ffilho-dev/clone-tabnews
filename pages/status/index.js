import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  return await response.json();
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdateAt />

      <h2>Banco de dados</h2>
      <DatabaseInfo />
    </>
  );
}

function UpdateAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.update_at).toLocaleString("pt-BR");
  }

  return <div>Última atualização: {updatedAtText}</div>;
}

function DatabaseInfo() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  if (!isLoading && data) {
    let { version, max_connections, opened_connections } =
      data.dependencies.database;

    return (
      <ul>
        <li>
          <strong>Versão:</strong> {version}
        </li>
        <li>
          <strong>Máximo de conexões:</strong> {max_connections}
        </li>
        <li>
          <strong>Conexões abertas:</strong> {opened_connections}
        </li>
      </ul>
    );
  } else {
    return <p>Carregando...</p>;
  }
}
