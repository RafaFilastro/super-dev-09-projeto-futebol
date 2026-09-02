const API_URL = "";

async function requisicao(caminho, opcoes = {}) {
    const resposta = await fetch(`${API_URL}${caminho}`, {
        headers: {
            "Content-Type": "application/json",
            ...(opcoes.headers || {}),
        },
        ...opcoes,
    });

    if (!resposta.ok) {
        let detalhe = `Erro ${resposta.status}`;

        try {
            const corpo = await resposta.json();
            detalhe = corpo.detail || corpo.mensagem || detalhe;
        } catch {
            // Mantém a mensagem baseada no status HTTP.
        }

        throw new Error(detalhe);
    }

    if (resposta.status === 204) {
        return null;
    }

    const tipo = resposta.headers.get("content-type") || "";
    return tipo.includes("application/json") ? resposta.json() : null;
}

export const api = {
    listarClubes: () => requisicao("/clubes"),
    criarClube: (dados) => requisicao("/clubes", {
        method: "POST",
        body: JSON.stringify(dados),
    }),
    editarClube: (id, dados) => requisicao(`/clubes/${id}`, {
        method: "PUT",
        body: JSON.stringify(dados),
    }),
    apagarClube: (id) => requisicao(`/clubes/${id}`, { method: "DELETE" }),

    listarJogadores: () => requisicao("/jogadores"),
    criarJogador: (dados) => requisicao("/jogadores", {
        method: "POST",
        body: JSON.stringify(dados),
    }),
    editarJogador: (id, dados) => requisicao(`/jogadores/${id}`, {
        method: "PUT",
        body: JSON.stringify(dados),
    }),
    apagarJogador: (id) => requisicao(`/jogadores/${id}`, { method: "DELETE" }),

    listarTecnicos: () => requisicao("/tecnicos"),
    criarTecnico: (dados) => requisicao("/tecnicos", {
        method: "POST",
        body: JSON.stringify(dados),
    }),
    editarTecnico: (id, dados) => requisicao(`/tecnicos/${id}`, {
        method: "PUT",
        body: JSON.stringify(dados),
    }),
    apagarTecnico: (id) => requisicao(`/tecnicos/${id}`, { method: "DELETE" }),

    listarEstadios: () => requisicao("/estadios"),
    criarEstadio: (dados) => requisicao("/estadios", {
        method: "POST",
        body: JSON.stringify(dados),
    }),
    editarEstadio: (id, dados) => requisicao(`/estadios/${id}`, {
        method: "PUT",
        body: JSON.stringify(dados),
    }),
    apagarEstadio: (id) => requisicao(`/estadios/${id}`, { method: "DELETE" }),
};
