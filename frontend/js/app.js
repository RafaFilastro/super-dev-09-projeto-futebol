import { api } from "./api.js";

const estado = {
    clubes: [],
    jogadores: [],
    tecnicos: [],
    estadios: [],
};

const paginas = [...document.querySelectorAll("[data-page]")];
const links = [...document.querySelectorAll("[data-page-link]")];
const modalBackdrop = document.querySelector("#modal-backdrop");
const modalContent = document.querySelector("#modal-content");
const menu = document.querySelector("#main-nav");

function escapar(valor = "") {
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function valorOuTraco(valor) {
    return valor === null || valor === undefined || valor === "" ? "—" : escapar(valor);
}

function formatarData(data) {
    if (!data) {
        return "—";
    }

    const [ano, mes, dia] = String(data).slice(0, 10).split("-");
    return `${dia}/${mes}/${ano}`;
}

function monograma(nome = "FC") {
    return nome
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join("")
        .toUpperCase();
}

function toast(mensagem, erro = false) {
    const container = document.querySelector("#toast-container");
    const elemento = document.createElement("div");
    elemento.className = `toast${erro ? " error" : ""}`;
    elemento.textContent = mensagem;
    container.appendChild(elemento);

    window.setTimeout(() => elemento.remove(), 3600);
}

function mostrarPagina(nome) {
    paginas.forEach((pagina) => {
        pagina.classList.toggle("active", pagina.dataset.page === nome);
    });

    links.forEach((link) => {
        link.classList.toggle("active", link.dataset.pageLink === nome);
    });

    menu.classList.remove("open");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function abrirModal(html) {
    modalContent.innerHTML = html;
    modalBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
}

function fecharModal() {
    modalBackdrop.hidden = true;
    modalContent.innerHTML = "";
    document.body.style.overflow = "";
}

function estadoCarregando(id) {
    const elemento = document.querySelector(id);
    if (elemento) {
        elemento.innerHTML = '<div class="loading-state">Carregando dados da API...</div>';
    }
}

async function carregarTudo() {
    ["#lista-clubes", "#lista-jogadores", "#lista-estadios", "#home-clubes"]
        .forEach(estadoCarregando);

    try {
        const [clubes, jogadores, tecnicos, estadios] = await Promise.all([
            api.listarClubes(),
            api.listarJogadores(),
            api.listarTecnicos(),
            api.listarEstadios(),
        ]);

        estado.clubes = clubes;
        estado.jogadores = jogadores;
        estado.tecnicos = tecnicos;
        estado.estadios = estadios;

        renderizarTudo();
    } catch (erro) {
        toast(`Não foi possível carregar a API: ${erro.message}`, true);
    }
}

function renderizarTudo() {
    document.querySelector("#stat-clubes").textContent = estado.clubes.length;
    document.querySelector("#stat-jogadores").textContent = estado.jogadores.length;
    document.querySelector("#stat-tecnicos").textContent = estado.tecnicos.length;
    document.querySelector("#stat-estadios").textContent = estado.estadios.length;

    renderizarClubes(estado.clubes);
    renderizarJogadores(estado.jogadores);
    renderizarTecnicos();
    renderizarEstadios();
    renderizarHome();
}

function renderizarHome() {
    const container = document.querySelector("#home-clubes");
    const destaques = estado.clubes.slice(0, 3);

    if (!destaques.length) {
        container.innerHTML = '<div class="empty-state">Nenhum clube cadastrado.</div>';
        return;
    }

    container.innerHTML = destaques.map((clube) => cardClube(clube, false)).join("");
}

function cardClube(clube, comAcoes = true) {
    return `
        <article class="club-card">
            <div class="card-top">
                <div class="club-monogram">${escapar(monograma(clube.nome))}</div>
                <span class="meta">#${clube.id}</span>
            </div>
            <h3>${escapar(clube.nome)}</h3>
            <div class="card-subtitle">${escapar(clube.cidade)} • ${escapar(clube.estado)}</div>
            <div class="card-details">
                <div class="card-detail">
                    <span>Fundação</span>
                    <strong>${valorOuTraco(clube.ano_fundacao)}</strong>
                </div>
                <div class="card-detail">
                    <span>Técnico</span>
                    <strong>${valorOuTraco(clube.tecnico?.nome)}</strong>
                </div>
                <div class="card-detail">
                    <span>Estádio</span>
                    <strong>${valorOuTraco(clube.estadio?.nome)}</strong>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn btn-ghost btn-small" data-ver-clube="${clube.id}">Detalhes</button>
                ${comAcoes ? `
                    <button class="btn btn-ghost btn-small" data-editar-clube="${clube.id}">Editar</button>
                    <button class="btn btn-danger btn-small" data-apagar-clube="${clube.id}">Excluir</button>
                ` : ""}
            </div>
        </article>
    `;
}

function renderizarClubes(lista) {
    const container = document.querySelector("#lista-clubes");

    if (!lista.length) {
        container.innerHTML = '<div class="empty-state">Nenhum clube encontrado.</div>';
        return;
    }

    container.innerHTML = lista.map((clube) => cardClube(clube)).join("");
}

function renderizarJogadores(lista) {
    const container = document.querySelector("#lista-jogadores");

    if (!lista.length) {
        container.innerHTML = '<div class="empty-state">Nenhum jogador encontrado.</div>';
        return;
    }

    container.innerHTML = lista.map((jogador) => `
        <article class="player-card">
            <div class="player-head">
                <div class="player-number">${valorOuTraco(jogador.numero)}</div>
                <span class="meta">#${jogador.id}</span>
            </div>
            <h3>${escapar(jogador.nome)}</h3>
            <div class="card-subtitle">${valorOuTraco(jogador.posicao)}</div>
            <div class="card-details">
                <div class="card-detail">
                    <span>Clube</span>
                    <strong>${valorOuTraco(jogador.clube?.nome)}</strong>
                </div>
                <div class="card-detail">
                    <span>Nascimento</span>
                    <strong>${formatarData(jogador.data_nascimento)}</strong>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn btn-ghost btn-small" data-editar-jogador="${jogador.id}">Editar</button>
                <button class="btn btn-danger btn-small" data-apagar-jogador="${jogador.id}">Excluir</button>
            </div>
        </article>
    `).join("");
}

function renderizarTecnicos() {
    const corpo = document.querySelector("#lista-tecnicos");

    if (!estado.tecnicos.length) {
        corpo.innerHTML = '<tr><td colspan="4">Nenhum técnico cadastrado.</td></tr>';
        return;
    }

    corpo.innerHTML = estado.tecnicos.map((tecnico) => `
        <tr>
            <td><strong>${escapar(tecnico.nome)}</strong></td>
            <td>${valorOuTraco(tecnico.nacionalidade)}</td>
            <td>${formatarData(tecnico.data_nascimento)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-ghost btn-small" data-editar-tecnico="${tecnico.id}">Editar</button>
                    <button class="btn btn-danger btn-small" data-apagar-tecnico="${tecnico.id}">Excluir</button>
                </div>
            </td>
        </tr>
    `).join("");
}

function renderizarEstadios() {
    const container = document.querySelector("#lista-estadios");

    if (!estado.estadios.length) {
        container.innerHTML = '<div class="empty-state">Nenhum estádio cadastrado.</div>';
        return;
    }

    container.innerHTML = estado.estadios.map((estadio) => `
        <article class="stadium-card">
            <div class="stadium-head">
                <div class="stadium-icon">▱</div>
                <span class="meta">#${estadio.id}</span>
            </div>
            <h3>${escapar(estadio.nome)}</h3>
            <div class="card-subtitle">${escapar(estadio.cidade)} • ${escapar(estadio.estado)}</div>
            <div class="card-details">
                <div class="card-detail">
                    <span>Capacidade</span>
                    <strong>${estadio.capacidade ? Number(estadio.capacidade).toLocaleString("pt-BR") : "—"}</strong>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn btn-ghost btn-small" data-editar-estadio="${estadio.id}">Editar</button>
                <button class="btn btn-danger btn-small" data-apagar-estadio="${estadio.id}">Excluir</button>
            </div>
        </article>
    `).join("");
}

function opcoes(lista, selecionado, rotulo) {
    return [
        `<option value="">Selecione ${rotulo}</option>`,
        ...lista.map((item) => `
            <option value="${item.id}" ${Number(selecionado) === Number(item.id) ? "selected" : ""}>
                ${escapar(item.nome)}
            </option>
        `),
    ].join("");
}

function formularioTecnico(tecnico = null) {
    abrirModal(`
        <span class="eyebrow">Cadastro</span>
        <h2>${tecnico ? "Editar técnico" : "Novo técnico"}</h2>
        <p class="modal-intro">Preencha os dados do profissional.</p>
        <form id="form-tecnico">
            <div class="form-grid">
                <div class="form-group full">
                    <label for="tecnico-nome">Nome</label>
                    <input id="tecnico-nome" name="nome" required value="${escapar(tecnico?.nome || "")}">
                </div>
                <div class="form-group">
                    <label for="tecnico-nacionalidade">Nacionalidade</label>
                    <input id="tecnico-nacionalidade" name="nacionalidade" value="${escapar(tecnico?.nacionalidade || "")}">
                </div>
                <div class="form-group">
                    <label for="tecnico-data">Data de nascimento</label>
                    <input id="tecnico-data" name="data_nascimento" type="date" value="${tecnico?.data_nascimento || ""}">
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-ghost" data-fechar-modal>Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
        </form>
    `);

    document.querySelector("#form-tecnico").addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const form = new FormData(evento.currentTarget);
        const dados = {
            nome: form.get("nome").trim(),
            nacionalidade: form.get("nacionalidade").trim() || null,
            data_nascimento: form.get("data_nascimento") || null,
        };

        await salvar(async () => {
            if (tecnico) {
                await api.editarTecnico(tecnico.id, dados);
            } else {
                await api.criarTecnico(dados);
            }
        }, "Técnico salvo com sucesso.");
    });
}

function formularioEstadio(estadio = null) {
    abrirModal(`
        <span class="eyebrow">Cadastro</span>
        <h2>${estadio ? "Editar estádio" : "Novo estádio"}</h2>
        <p class="modal-intro">Cadastre o palco onde a bola rola.</p>
        <form id="form-estadio">
            <div class="form-grid">
                <div class="form-group full">
                    <label for="estadio-nome">Nome</label>
                    <input id="estadio-nome" name="nome" required value="${escapar(estadio?.nome || "")}">
                </div>
                <div class="form-group">
                    <label for="estadio-cidade">Cidade</label>
                    <input id="estadio-cidade" name="cidade" required value="${escapar(estadio?.cidade || "")}">
                </div>
                <div class="form-group">
                    <label for="estadio-estado">Estado</label>
                    <input id="estadio-estado" name="estado" maxlength="2" required value="${escapar(estadio?.estado || "")}">
                </div>
                <div class="form-group full">
                    <label for="estadio-capacidade">Capacidade</label>
                    <input id="estadio-capacidade" name="capacidade" type="number" min="0" value="${estadio?.capacidade ?? ""}">
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-ghost" data-fechar-modal>Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
        </form>
    `);

    document.querySelector("#form-estadio").addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const form = new FormData(evento.currentTarget);
        const capacidade = form.get("capacidade");
        const dados = {
            nome: form.get("nome").trim(),
            cidade: form.get("cidade").trim(),
            estado: form.get("estado").trim().toUpperCase(),
            capacidade: capacidade ? Number(capacidade) : null,
        };

        await salvar(async () => {
            if (estadio) {
                await api.editarEstadio(estadio.id, dados);
            } else {
                await api.criarEstadio(dados);
            }
        }, "Estádio salvo com sucesso.");
    });
}

function formularioClube(clube = null) {
    abrirModal(`
        <span class="eyebrow">Cadastro</span>
        <h2>${clube ? "Editar clube" : "Novo clube"}</h2>
        <p class="modal-intro">Vincule o clube a um técnico e a um estádio.</p>
        <form id="form-clube">
            <div class="form-grid">
                <div class="form-group full">
                    <label for="clube-nome">Nome</label>
                    <input id="clube-nome" name="nome" required value="${escapar(clube?.nome || "")}">
                </div>
                <div class="form-group">
                    <label for="clube-cidade">Cidade</label>
                    <input id="clube-cidade" name="cidade" required value="${escapar(clube?.cidade || "")}">
                </div>
                <div class="form-group">
                    <label for="clube-estado">Estado</label>
                    <input id="clube-estado" name="estado" maxlength="2" required value="${escapar(clube?.estado || "")}">
                </div>
                <div class="form-group">
                    <label for="clube-ano">Ano de fundação</label>
                    <input id="clube-ano" name="ano_fundacao" type="number" min="1800" max="2100" value="${clube?.ano_fundacao ?? ""}">
                </div>
                <div class="form-group">
                    <label for="clube-tecnico">Técnico</label>
                    <select id="clube-tecnico" name="id_tecnico" required>
                        ${opcoes(estado.tecnicos, clube?.tecnico?.id, "um técnico")}
                    </select>
                </div>
                <div class="form-group full">
                    <label for="clube-estadio">Estádio</label>
                    <select id="clube-estadio" name="id_estadio" required>
                        ${opcoes(estado.estadios, clube?.estadio?.id, "um estádio")}
                    </select>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-ghost" data-fechar-modal>Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
        </form>
    `);

    document.querySelector("#form-clube").addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const form = new FormData(evento.currentTarget);
        const ano = form.get("ano_fundacao");
        const dados = {
            nome: form.get("nome").trim(),
            cidade: form.get("cidade").trim(),
            estado: form.get("estado").trim().toUpperCase(),
            id_tecnico: Number(form.get("id_tecnico")),
            id_estadio: Number(form.get("id_estadio")),
            ano_fundacao: ano ? Number(ano) : null,
        };

        await salvar(async () => {
            if (clube) {
                await api.editarClube(clube.id, dados);
            } else {
                await api.criarClube(dados);
            }
        }, "Clube salvo com sucesso.");
    });
}

function formularioJogador(jogador = null) {
    abrirModal(`
        <span class="eyebrow">Elenco</span>
        <h2>${jogador ? "Editar jogador" : "Novo jogador"}</h2>
        <p class="modal-intro">Cadastre o atleta e selecione o clube pelo nome.</p>
        <form id="form-jogador">
            <div class="form-grid">
                <div class="form-group full">
                    <label for="jogador-nome">Nome</label>
                    <input id="jogador-nome" name="nome" required value="${escapar(jogador?.nome || "")}">
                </div>
                <div class="form-group">
                    <label for="jogador-clube">Clube</label>
                    <select id="jogador-clube" name="id_clube" required>
                        ${opcoes(estado.clubes, jogador?.clube?.id, "um clube")}
                    </select>
                </div>
                <div class="form-group">
                    <label for="jogador-numero">Número</label>
                    <input id="jogador-numero" name="numero" type="number" min="0" value="${jogador?.numero ?? ""}">
                </div>
                <div class="form-group">
                    <label for="jogador-posicao">Posição</label>
                    <input id="jogador-posicao" name="posicao" value="${escapar(jogador?.posicao || "")}">
                </div>
                <div class="form-group">
                    <label for="jogador-data">Data de nascimento</label>
                    <input id="jogador-data" name="data_nascimento" type="date" value="${jogador?.data_nascimento || ""}">
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-ghost" data-fechar-modal>Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
        </form>
    `);

    document.querySelector("#form-jogador").addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const form = new FormData(evento.currentTarget);
        const numero = form.get("numero");
        const dados = {
            nome: form.get("nome").trim(),
            id_clube: Number(form.get("id_clube")),
            numero: numero ? Number(numero) : null,
            posicao: form.get("posicao").trim() || null,
            data_nascimento: form.get("data_nascimento") || null,
        };

        await salvar(async () => {
            if (jogador) {
                await api.editarJogador(jogador.id, dados);
            } else {
                await api.criarJogador(dados);
            }
        }, "Jogador salvo com sucesso.");
    });
}

async function salvar(operacao, mensagem) {
    try {
        await operacao();
        fecharModal();
        toast(mensagem);
        await carregarTudo();
    } catch (erro) {
        toast(erro.message, true);
    }
}

function detalheClube(clube) {
    const jogadores = estado.jogadores.filter((jogador) => jogador.clube?.id === clube.id);

    abrirModal(`
        <div class="detail-hero">
            <div class="detail-monogram">${escapar(monograma(clube.nome))}</div>
            <div>
                <span class="eyebrow">Clube #${clube.id}</span>
                <h2>${escapar(clube.nome)}</h2>
                <p class="modal-intro">${escapar(clube.cidade)} • ${escapar(clube.estado)}</p>
            </div>
        </div>
        <div class="detail-grid">
            <div class="detail-box">
                <small>Fundação</small>
                <strong>${valorOuTraco(clube.ano_fundacao)}</strong>
            </div>
            <div class="detail-box">
                <small>Técnico</small>
                <strong>${valorOuTraco(clube.tecnico?.nome)}</strong>
            </div>
            <div class="detail-box">
                <small>Estádio</small>
                <strong>${valorOuTraco(clube.estadio?.nome)}</strong>
            </div>
            <div class="detail-box">
                <small>Jogadores cadastrados</small>
                <strong>${jogadores.length}</strong>
            </div>
        </div>
    `);
}

async function confirmarExclusao(tipo, item, operacao) {
    const aceitou = window.confirm(`Excluir ${tipo} "${item.nome}"?`);
    if (!aceitou) {
        return;
    }

    try {
        await operacao();
        toast(`${tipo} excluído com sucesso.`);
        await carregarTudo();
    } catch (erro) {
        toast(
            `${erro.message}. O registro pode estar vinculado a outro cadastro.`,
            true,
        );
    }
}

document.addEventListener("click", (evento) => {
    const alvo = evento.target.closest("button, a");
    if (!alvo) {
        return;
    }

    if (alvo.dataset.pageLink) {
        evento.preventDefault();
        const pagina = alvo.dataset.pageLink;
        location.hash = pagina;
        mostrarPagina(pagina);
    }

    if (alvo.dataset.go) {
        const pagina = alvo.dataset.go;
        location.hash = pagina;
        mostrarPagina(pagina);
    }

    if (alvo.dataset.fecharModal !== undefined) {
        fecharModal();
    }

    const encontrar = (lista, id) => lista.find((item) => item.id === Number(id));

    if (alvo.dataset.action === "novo-tecnico") formularioTecnico();
    if (alvo.dataset.action === "novo-estadio") formularioEstadio();
    if (alvo.dataset.action === "novo-clube") formularioClube();
    if (alvo.dataset.action === "novo-jogador") formularioJogador();

    if (alvo.dataset.verClube) {
        detalheClube(encontrar(estado.clubes, alvo.dataset.verClube));
    }

    if (alvo.dataset.editarTecnico) {
        formularioTecnico(encontrar(estado.tecnicos, alvo.dataset.editarTecnico));
    }
    if (alvo.dataset.editarEstadio) {
        formularioEstadio(encontrar(estado.estadios, alvo.dataset.editarEstadio));
    }
    if (alvo.dataset.editarClube) {
        formularioClube(encontrar(estado.clubes, alvo.dataset.editarClube));
    }
    if (alvo.dataset.editarJogador) {
        formularioJogador(encontrar(estado.jogadores, alvo.dataset.editarJogador));
    }

    if (alvo.dataset.apagarTecnico) {
        const item = encontrar(estado.tecnicos, alvo.dataset.apagarTecnico);
        confirmarExclusao("Técnico", item, () => api.apagarTecnico(item.id));
    }
    if (alvo.dataset.apagarEstadio) {
        const item = encontrar(estado.estadios, alvo.dataset.apagarEstadio);
        confirmarExclusao("Estádio", item, () => api.apagarEstadio(item.id));
    }
    if (alvo.dataset.apagarClube) {
        const item = encontrar(estado.clubes, alvo.dataset.apagarClube);
        confirmarExclusao("Clube", item, () => api.apagarClube(item.id));
    }
    if (alvo.dataset.apagarJogador) {
        const item = encontrar(estado.jogadores, alvo.dataset.apagarJogador);
        confirmarExclusao("Jogador", item, () => api.apagarJogador(item.id));
    }
});

document.querySelector("#modal-close").addEventListener("click", fecharModal);
modalBackdrop.addEventListener("click", (evento) => {
    if (evento.target === modalBackdrop) {
        fecharModal();
    }
});

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
        fecharModal();
    }
});

document.querySelector("#menu-toggle").addEventListener("click", () => {
    menu.classList.toggle("open");
});

document.querySelector("#busca-clubes").addEventListener("input", (evento) => {
    const termo = evento.target.value.toLowerCase();
    const filtrados = estado.clubes.filter((clube) =>
        [clube.nome, clube.cidade, clube.estado]
            .some((campo) => String(campo || "").toLowerCase().includes(termo)),
    );
    renderizarClubes(filtrados);
});

document.querySelector("#busca-jogadores").addEventListener("input", (evento) => {
    const termo = evento.target.value.toLowerCase();
    const filtrados = estado.jogadores.filter((jogador) =>
        [jogador.nome, jogador.posicao, jogador.clube?.nome]
            .some((campo) => String(campo || "").toLowerCase().includes(termo)),
    );
    renderizarJogadores(filtrados);
});

window.addEventListener("hashchange", () => {
    const pagina = location.hash.replace("#", "") || "inicio";
    mostrarPagina(pagina);
});

const paginaInicial = location.hash.replace("#", "") || "inicio";
mostrarPagina(paginaInicial);
carregarTudo();
