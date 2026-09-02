import { api } from "./api.js?v=10.0.0";

const estado = {
    clubes: [],
    jogadores: [],
    tecnicos: [],
    estadios: [],
    campeonatos: [],
    partidas: [],
    gols: [],
};

const paginas = [...document.querySelectorAll("[data-page]")];
const links = [...document.querySelectorAll("[data-page-link]")];
const modalBackdrop = document.querySelector("#modal-backdrop");
const modalContent = document.querySelector("#modal-content");
const menu = document.querySelector("#main-nav");

let intervaloPartida = null;
let encerrarPartidaRapido = null;
let timerMensagemGol = null;
let campeonatoHomeSelecionado = null;

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

function formatarDataHora(data) {
    if (!data) {
        return "—";
    }

    const texto = String(data);
    const [dataParte, horaParte = ""] = texto.split("T");
    const [ano, mes, dia] = dataParte.split("-");
    const hora = horaParte.slice(0, 5);
    return `${dia}/${mes}/${ano}${hora ? ` • ${hora}` : ""}`;
}

function valorDatetimeLocal(data) {
    return data ? String(data).slice(0, 16) : "";
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

function abrirModal(html, tipo = "form") {
    modalContent.innerHTML = html;

    const modal = modalBackdrop.querySelector(".modal");
    modal?.classList.remove("match-modal", "form-modal");
    modal?.classList.add(tipo === "match" ? "match-modal" : "form-modal");

    modalBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
}

function fecharModal() {
    if (intervaloPartida) {
        window.clearInterval(intervaloPartida);
        intervaloPartida = null;
    }

    if (timerMensagemGol) {
        window.clearTimeout(timerMensagemGol);
        timerMensagemGol = null;
    }

    encerrarPartidaRapido = null;
    modalBackdrop.hidden = true;
    modalContent.innerHTML = "";

    const modal = modalBackdrop.querySelector(".modal");
    modal?.classList.remove("match-modal", "form-modal");

    document.body.style.overflow = "";
}

function estadoCarregando(id) {
    const elemento = document.querySelector(id);
    if (elemento) {
        elemento.innerHTML = '<div class="loading-state">Carregando dados da API...</div>';
    }
}

async function carregarTudo() {
    [
        "#lista-clubes",
        "#lista-jogadores",
        "#lista-estadios",
        "#home-clubes",
        "#lista-campeonatos",
        "#lista-partidas",
        "#lista-gols",
    ].forEach(estadoCarregando);

    const chamadas = [
        ["clubes", api.listarClubes()],
        ["jogadores", api.listarJogadores()],
        ["tecnicos", api.listarTecnicos()],
        ["estadios", api.listarEstadios()],
        ["campeonatos", api.listarCampeonatos()],
        ["partidas", api.listarPartidas()],
        ["gols", api.listarGols()],
    ];

    const resultados = await Promise.allSettled(
        chamadas.map(([, promessa]) => promessa),
    );

    const erros = [];
    resultados.forEach((resultado, indice) => {
        const [chave] = chamadas[indice];
        if (resultado.status === "fulfilled") {
            estado[chave] = resultado.value || [];
        } else {
            estado[chave] = [];
            erros.push({
                chave,
                mensagem: resultado.reason.message,
            });
        }
    });

    const falhouPartidas = erros.some((item) => item.chave === "partidas");
    const falhouGols = erros.some((item) => item.chave === "gols");

    if (!falhouPartidas && !falhouGols) {
        try {
            const sincronizacao = await api.sincronizarGolsPartidas();

            if (sincronizacao.partidas_sincronizadas > 0) {
                const [partidas, gols] = await Promise.all([
                    api.listarPartidas(),
                    api.listarGols(),
                ]);
                estado.partidas = partidas || [];
                estado.gols = gols || [];
            }

            if (sincronizacao.avisos?.length) {
                toast(
                    `${sincronizacao.avisos.length} partida(s) não puderam sincronizar gols por falta de jogadores.`,
                    true,
                );
            }
        } catch (erro) {
            toast(`Não foi possível sincronizar os gols: ${erro.message}`, true);
        }
    }

    renderizarTudo();

    if (erros.length) {
        const resumo = erros
            .map((item) => `${item.chave}: ${item.mensagem}`)
            .join(" | ");
        toast(`Alguns dados não carregaram: ${resumo}`, true);
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
    renderizarCompeticoes();
    renderizarHome();
}

function partidaRealizada(partida) {
    const golsRegistrados = estado.gols.some(
        (gol) => Number(gol.id_partida) === Number(partida.id),
    );
    const temPlacar = Number(partida.gols_mandante || 0) > 0
        || Number(partida.gols_visitante || 0) > 0;

    if (golsRegistrados || temPlacar) {
        return true;
    }

    if (!partida.data_partida) {
        return false;
    }

    const dataPartida = new Date(partida.data_partida);
    return !Number.isNaN(dataPartida.getTime()) && dataPartida <= new Date();
}

function calcularClassificacao(idCampeonato) {
    const partidasDoCampeonato = estado.partidas.filter(
        (partida) => Number(partida.id_campeonato) === Number(idCampeonato),
    );
    const realizadas = partidasDoCampeonato.filter(partidaRealizada);
    const clubesParticipantes = new Set();

    partidasDoCampeonato.forEach((partida) => {
        clubesParticipantes.add(Number(partida.id_mandante));
        clubesParticipantes.add(Number(partida.id_visitante));
    });

    const tabela = new Map();

    clubesParticipantes.forEach((idClube) => {
        const clube = clubePorId(idClube);
        tabela.set(idClube, {
            id: idClube,
            nome: clube?.nome || `Clube #${idClube}`,
            pontos: 0,
            jogos: 0,
            vitorias: 0,
            empates: 0,
            derrotas: 0,
            golsPro: 0,
            golsContra: 0,
            saldo: 0,
        });
    });

    realizadas.forEach((partida) => {
        const mandante = tabela.get(Number(partida.id_mandante));
        const visitante = tabela.get(Number(partida.id_visitante));
        if (!mandante || !visitante) {
            return;
        }

        const golsMandante = Number(partida.gols_mandante || 0);
        const golsVisitante = Number(partida.gols_visitante || 0);

        mandante.jogos += 1;
        visitante.jogos += 1;
        mandante.golsPro += golsMandante;
        mandante.golsContra += golsVisitante;
        visitante.golsPro += golsVisitante;
        visitante.golsContra += golsMandante;

        if (golsMandante > golsVisitante) {
            mandante.vitorias += 1;
            mandante.pontos += 3;
            visitante.derrotas += 1;
        } else if (golsVisitante > golsMandante) {
            visitante.vitorias += 1;
            visitante.pontos += 3;
            mandante.derrotas += 1;
        } else {
            mandante.empates += 1;
            visitante.empates += 1;
            mandante.pontos += 1;
            visitante.pontos += 1;
        }
    });

    const classificacao = [...tabela.values()].map((item) => ({
        ...item,
        saldo: item.golsPro - item.golsContra,
    }));

    classificacao.sort((a, b) =>
        b.pontos - a.pontos
        || b.vitorias - a.vitorias
        || b.saldo - a.saldo
        || b.golsPro - a.golsPro
        || a.nome.localeCompare(b.nome, "pt-BR"),
    );

    return {
        classificacao,
        realizadas: realizadas.length,
        total: partidasDoCampeonato.length,
    };
}

function renderizarTabelaCampeonatoHome() {
    const seletor = document.querySelector("#home-campeonato-select");
    const corpo = document.querySelector("#home-league-body");
    const meta = document.querySelector("#home-league-meta");

    if (!seletor || !corpo || !meta) {
        return;
    }

    if (!estado.campeonatos.length) {
        seletor.innerHTML = '<option value="">Nenhum campeonato cadastrado</option>';
        corpo.innerHTML = '<tr><td colspan="8">Cadastre um campeonato para gerar a classificação.</td></tr>';
        meta.textContent = "A tabela será calculada automaticamente conforme as partidas forem realizadas.";
        return;
    }

    const campeonatosOrdenados = [...estado.campeonatos].sort(
        (a, b) => Number(b.temporada || 0) - Number(a.temporada || 0) || a.nome.localeCompare(b.nome, "pt-BR"),
    );

    if (
        !campeonatoHomeSelecionado
        || !estado.campeonatos.some((item) => Number(item.id) === Number(campeonatoHomeSelecionado))
    ) {
        campeonatoHomeSelecionado = campeonatosOrdenados[0].id;
    }

    seletor.innerHTML = campeonatosOrdenados.map((campeonato) => `
        <option value="${campeonato.id}" ${Number(campeonato.id) === Number(campeonatoHomeSelecionado) ? "selected" : ""}>
            ${escapar(campeonato.nome)}${campeonato.temporada ? ` • ${escapar(campeonato.temporada)}` : ""}
        </option>
    `).join("");

    const campeonato = campeonatoPorId(campeonatoHomeSelecionado);
    const resultado = calcularClassificacao(campeonatoHomeSelecionado);

    meta.innerHTML = `
        <strong>${escapar(campeonato?.nome || "Campeonato")}</strong>
        <span>${resultado.realizadas} de ${resultado.total} partida(s) contabilizada(s)</span>
    `;

    if (!resultado.classificacao.length) {
        corpo.innerHTML = '<tr><td colspan="8">Ainda não há clubes vinculados a partidas deste campeonato.</td></tr>';
        return;
    }

    corpo.innerHTML = resultado.classificacao.map((item, indice) => `
        <tr>
            <td><span class="league-position ${indice < 4 ? "top" : ""}">${indice + 1}</span></td>
            <td>
                <div class="league-club">
                    <span class="league-club-badge">${escapar(monograma(item.nome))}</span>
                    <strong>${escapar(item.nome)}</strong>
                </div>
            </td>
            <td><strong class="league-points">${item.pontos}</strong></td>
            <td>${item.jogos}</td>
            <td>${item.vitorias}</td>
            <td>${item.empates}</td>
            <td>${item.derrotas}</td>
            <td class="${item.saldo > 0 ? "positive" : item.saldo < 0 ? "negative" : ""}">${item.saldo > 0 ? "+" : ""}${item.saldo}</td>
        </tr>
    `).join("");
}

function renderizarHome() {
    renderizarTabelaCampeonatoHome();
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


function campeonatoPorId(id) {
    return estado.campeonatos.find((item) => item.id === Number(id));
}

function clubePorId(id) {
    return estado.clubes.find((item) => item.id === Number(id));
}

function jogadorPorId(id) {
    return estado.jogadores.find((item) => item.id === Number(id));
}

function partidaPorId(id) {
    return estado.partidas.find((item) => item.id === Number(id));
}

function rotuloPartida(partida) {
    if (!partida) {
        return "Partida não encontrada";
    }

    const mandante = clubePorId(partida.id_mandante)?.nome || `Clube #${partida.id_mandante}`;
    const visitante = clubePorId(partida.id_visitante)?.nome || `Clube #${partida.id_visitante}`;
    return `${mandante} × ${visitante}`;
}

function renderizarCompeticoes() {
    document.querySelector("#stat-campeonatos").textContent = estado.campeonatos.length;
    document.querySelector("#stat-partidas").textContent = estado.partidas.length;
    document.querySelector("#stat-gols").textContent = estado.gols.length;

    renderizarCampeonatos();
    renderizarPartidas();
    renderizarGols();
}

function renderizarCampeonatos() {
    const container = document.querySelector("#lista-campeonatos");

    if (!estado.campeonatos.length) {
        container.innerHTML = '<div class="empty-state">Nenhum campeonato cadastrado.</div>';
        return;
    }

    container.innerHTML = estado.campeonatos.map((campeonato) => {
        const partidas = estado.partidas.filter(
            (partida) => partida.id_campeonato === campeonato.id,
        ).length;

        return `
            <article class="championship-card">
                <div class="championship-badge">🏆</div>
                <div class="championship-content">
                    <div class="card-top">
                        <span class="meta">#${campeonato.id}</span>
                        <span class="season-pill">${escapar(campeonato.temporada)}</span>
                    </div>
                    <h3>${escapar(campeonato.nome)}</h3>
                    <p>${partidas} ${partidas === 1 ? "partida cadastrada" : "partidas cadastradas"}</p>
                    <div class="card-actions">
                        <button class="btn btn-ghost btn-small" data-editar-campeonato="${campeonato.id}">Editar</button>
                        <button class="btn btn-danger btn-small" data-apagar-campeonato="${campeonato.id}">Excluir</button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

function renderizarPartidas() {
    const container = document.querySelector("#lista-partidas");

    if (!estado.partidas.length) {
        container.innerHTML = '<div class="empty-state">Nenhuma partida cadastrada.</div>';
        return;
    }

    const partidas = [...estado.partidas].sort(
        (a, b) => String(b.data_partida).localeCompare(String(a.data_partida)),
    );

    container.innerHTML = partidas.map((partida) => {
        const campeonato = campeonatoPorId(partida.id_campeonato);
        const mandante = clubePorId(partida.id_mandante);
        const visitante = clubePorId(partida.id_visitante);
        const golsDaPartida = estado.gols.filter((gol) => gol.id_partida === partida.id).length;

        return `
            <article class="match-card">
                <div class="match-topline">
                    <span>${valorOuTraco(campeonato?.nome)}</span>
                    <span class="meta">#${partida.id}</span>
                </div>
                <time>${formatarDataHora(partida.data_partida)}</time>
                <div class="match-score">
                    <div class="match-team">
                        <span class="team-monogram">${escapar(monograma(mandante?.nome || "MD"))}</span>
                        <strong>${valorOuTraco(mandante?.nome)}</strong>
                    </div>
                    <div class="score-box">
                        <strong>${partida.gols_mandante}</strong>
                        <span>×</span>
                        <strong>${partida.gols_visitante}</strong>
                    </div>
                    <div class="match-team away">
                        <span class="team-monogram">${escapar(monograma(visitante?.nome || "VS"))}</span>
                        <strong>${valorOuTraco(visitante?.nome)}</strong>
                    </div>
                </div>
                <div class="match-footer">
                    <span>⚽ ${golsDaPartida} ${golsDaPartida === 1 ? "gol registrado" : "gols registrados"}</span>
                    <div class="card-actions">
                        <button class="btn btn-match btn-small" data-jogar-partida="${partida.id}">
                            ${golsDaPartida ? "↻ Rejogar" : "▶ Jogar partida"}
                        </button>
                        <button class="btn btn-ghost btn-small" data-editar-partida="${partida.id}">Editar</button>
                        <button class="btn btn-danger btn-small" data-apagar-partida="${partida.id}">Excluir</button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}


function adicionarEventoPartida(html, destaque = false) {
    const feed = document.querySelector("#match-live-feed");
    if (!feed) {
        return;
    }

    const item = document.createElement("div");
    item.className = `match-live-event${destaque ? " goal" : ""}`;
    item.innerHTML = html;
    feed.appendChild(item);
    feed.scrollTop = feed.scrollHeight;
}

function animarGol(evento) {
    const palco = document.querySelector("#match-live-stage");
    const mensagem = document.querySelector("#match-pitch-message");
    const mensagemClube = document.querySelector("#match-pitch-goal-club");
    const mensagemJogador = document.querySelector("#match-pitch-goal-player");

    if (!palco) {
        return;
    }

    palco.classList.remove("goal-flash");
    void palco.offsetWidth;
    palco.classList.add("goal-flash");

    if (!mensagem || !mensagemClube || !mensagemJogador) {
        return;
    }

    if (timerMensagemGol) {
        window.clearTimeout(timerMensagemGol);
    }

    mensagemClube.textContent = "GOOOOL!";
    mensagemJogador.textContent = `${evento.clube} • ${evento.jogador} marca aos ${evento.minuto}'`;
    mensagem.hidden = false;
    mensagem.classList.remove("show");
    void mensagem.offsetWidth;
    mensagem.classList.add("show");

    timerMensagemGol = window.setTimeout(() => {
        mensagem.classList.remove("show");
        mensagem.hidden = true;
        timerMensagemGol = null;
    }, 1900);
}

async function jogarPartida(id) {
    const partida = partidaPorId(id);
    if (!partida) {
        toast("Partida não encontrada.", true);
        return;
    }

    const mandante = clubePorId(partida.id_mandante);
    const visitante = clubePorId(partida.id_visitante);
    const campeonato = campeonatoPorId(partida.id_campeonato);

    abrirModal(`
        <div class="match-live" id="match-live-stage">
            <header class="match-live-header">
                <span class="live-badge" id="match-live-badge">
                    <i></i>
                    <span>SIMULAÇÃO AO VIVO</span>
                </span>
                <div class="match-live-competition">
                    <strong>${valorOuTraco(campeonato?.nome)}</strong>
                    <span>Central da partida • Simulação oficial</span>
                </div>
            </header>

            <div class="match-live-layout">
                <div class="match-live-main">
                    <div class="match-live-scoreboard">
                        <div class="match-live-team">
                            <span class="match-live-crest">
                                ${escapar(monograma(mandante?.nome || "MD"))}
                            </span>
                            <strong>${valorOuTraco(mandante?.nome)}</strong>
                            <small>Mandante</small>
                        </div>

                        <div class="match-live-center">
                            <div class="match-live-clock">
                                <strong id="match-live-minute">00'</strong>
                                <span id="match-live-status">Preparando</span>
                            </div>
                            <div class="match-live-score">
                                <strong id="match-live-home">0</strong>
                                <span>×</span>
                                <strong id="match-live-away">0</strong>
                            </div>
                        </div>

                        <div class="match-live-team away">
                            <span class="match-live-crest">
                                ${escapar(monograma(visitante?.nome || "VS"))}
                            </span>
                            <strong>${valorOuTraco(visitante?.nome)}</strong>
                            <small>Visitante</small>
                        </div>
                    </div>

                    <div class="match-live-pitch" aria-hidden="true">
                        <div class="pitch-atmosphere"></div>
                        <div class="pitch-touchline"></div>
                        <div class="pitch-midline"></div>
                        <div class="pitch-circle"></div>
                        <div class="pitch-box pitch-box-left"></div>
                        <div class="pitch-box pitch-box-right"></div>
                        <div class="pitch-goal-area pitch-goal-area-left"></div>
                        <div class="pitch-goal-area pitch-goal-area-right"></div>
                        <div class="pitch-goal pitch-goal-left"></div>
                        <div class="pitch-goal pitch-goal-right"></div>
                        <span class="pitch-penalty-spot pitch-penalty-spot-left"></span>
                        <span class="pitch-penalty-spot pitch-penalty-spot-right"></span>
                        <span class="pitch-center-spot"></span>
                        <span class="pitch-corner pitch-corner-tl"></span>
                        <span class="pitch-corner pitch-corner-tr"></span>
                        <span class="pitch-corner pitch-corner-bl"></span>
                        <span class="pitch-corner pitch-corner-br"></span>
                        <span class="live-ball">
                            <img src="/static/assets/bola-futebol-classica.png?v=12" alt="">
                        </span>

                        <div class="match-pitch-message" id="match-pitch-message" hidden>
                            <span class="match-pitch-message-icon">
                                <img src="/static/assets/bola-futebol-classica.png?v=12" alt="">
                            </span>
                            <div>
                                <strong id="match-pitch-goal-club">GOOOOL!</strong>
                                <small id="match-pitch-goal-player"></small>
                            </div>
                        </div>

                        <div class="match-pitch-finished" id="match-pitch-finished" hidden>
                            <span>✓</span>
                            <div>
                                <strong>PARTIDA ENCERRADA</strong>
                                <small id="match-pitch-final-score"></small>
                            </div>
                        </div>
                    </div>

                    <div class="match-live-commentary" id="match-live-commentary">
                        A arbitragem confere tudo para o início do jogo.
                    </div>
                </div>

                <aside class="match-live-timeline">
                    <div class="match-live-timeline-header">
                        <div>
                            <span>LANCES DA PARTIDA</span>
                            <strong>Tempo real</strong>
                        </div>
                        <span class="timeline-dot"></span>
                    </div>
                    <div class="match-live-feed" id="match-live-feed"></div>
                </aside>
            </div>

            <div class="match-live-actions">
                <button class="btn btn-ghost" type="button" data-fechar-modal>
                    Fechar
                </button>
                <button class="btn btn-primary" type="button" id="skip-match" disabled>
                    Ver resultado agora
                </button>
            </div>
        </div>
    `, "match");

    try {
        const simulacao = await api.simularPartida(id);
        iniciarAnimacaoPartida(simulacao);
    } catch (erro) {
        const status = document.querySelector("#match-live-status");
        const comentario = document.querySelector("#match-live-commentary");
        if (status) status.textContent = "Falha na simulação";
        if (comentario) comentario.textContent = erro.message;
        toast(erro.message, true);
    }
}

function iniciarAnimacaoPartida(simulacao) {
    const eventos = [...(simulacao.eventos || [])].sort(
        (a, b) => a.minuto - b.minuto,
    );
    const partida = simulacao.partida;
    const minutoEl = document.querySelector("#match-live-minute");
    const statusEl = document.querySelector("#match-live-status");
    const casaEl = document.querySelector("#match-live-home");
    const foraEl = document.querySelector("#match-live-away");
    const comentarioEl = document.querySelector("#match-live-commentary");
    const pular = document.querySelector("#skip-match");
    const badgeEl = document.querySelector("#match-live-badge");

    if (!minutoEl || !statusEl || !casaEl || !foraEl || !comentarioEl) {
        return;
    }

    let minuto = 0;
    let indiceEvento = 0;
    let placarMandante = 0;
    let placarVisitante = 0;
    let finalizado = false;

    const comentarios = new Map([
        [1, "Bola rolando! Os dois times começam estudando os espaços."],
        [12, "O jogo ganha ritmo e as equipes tentam acelerar pelos lados."],
        [27, "Disputa forte no meio-campo. Ninguém quer entregar espaço."],
        [45, "Intervalo. Hora de ajustar a estratégia para a segunda etapa."],
        [58, "A torcida aumenta o volume e empurra os jogadores."],
        [73, "Entramos na reta decisiva. Cada ataque pode mudar o jogo."],
        [84, "Minutos finais. A tensão cresce a cada posse de bola."],
    ]);

    function revelarEventosAte(minutoAtual) {
        while (
            indiceEvento < eventos.length
            && eventos[indiceEvento].minuto <= minutoAtual
        ) {
            const evento = eventos[indiceEvento];
            placarMandante = evento.placar_mandante;
            placarVisitante = evento.placar_visitante;
            casaEl.textContent = placarMandante;
            foraEl.textContent = placarVisitante;
            comentarioEl.innerHTML = `
                <strong>GOOOOL!</strong>
                ${escapar(evento.jogador)} marca para ${escapar(evento.clube)}.
            `;
            adicionarEventoPartida(
                `<strong>${evento.minuto}' ⚽ ${escapar(evento.jogador)}</strong>`
                + `<span>${escapar(evento.clube)} • ${placarMandante} × ${placarVisitante}</span>`,
                true,
            );
            animarGol(evento);
            indiceEvento += 1;
        }
    }

    async function finalizar() {
        if (finalizado) {
            return;
        }

        finalizado = true;
        if (intervaloPartida) {
            window.clearInterval(intervaloPartida);
            intervaloPartida = null;
        }

        revelarEventosAte(90);
        minuto = 90;
        minutoEl.textContent = "90'";
        casaEl.textContent = partida.gols_mandante;
        foraEl.textContent = partida.gols_visitante;
        statusEl.textContent = "FIM DE JOGO";
        if (badgeEl) {
            badgeEl.classList.add("finished");
            badgeEl.innerHTML = "<span>✓ PARTIDA ENCERRADA</span>";
        }

        if (timerMensagemGol) {
            window.clearTimeout(timerMensagemGol);
            timerMensagemGol = null;
        }

        const campo = document.querySelector(".match-live-pitch");
        const bola = document.querySelector(".match-live-pitch .live-ball");
        const mensagemGol = document.querySelector("#match-pitch-message");
        const encerrada = document.querySelector("#match-pitch-finished");
        const placarFinal = document.querySelector("#match-pitch-final-score");

        campo?.classList.add("finished");
        if (bola) {
            bola.hidden = true;
        }

        if (mensagemGol) {
            mensagemGol.hidden = true;
            mensagemGol.classList.remove("show");
        }

        if (encerrada && placarFinal) {
            placarFinal.textContent = `${partida.mandante} ${partida.gols_mandante} × ${partida.gols_visitante} ${partida.visitante}`;
            encerrada.hidden = false;
            encerrada.classList.add("show");
        }
        comentarioEl.innerHTML = `
            <strong>Apito final!</strong>
            ${escapar(partida.mandante)} ${partida.gols_mandante}
            × ${partida.gols_visitante} ${escapar(partida.visitante)}.
        `;
        adicionarEventoPartida(
            `<strong>90' 🏁 Fim de jogo</strong>`
            + `<span>${escapar(partida.mandante)} ${partida.gols_mandante}`
            + ` × ${partida.gols_visitante} ${escapar(partida.visitante)}</span>`,
        );
        if (pular) {
            pular.disabled = true;
            pular.textContent = "Partida finalizada";
        }
        encerrarPartidaRapido = null;
        await carregarTudo();
    }

    encerrarPartidaRapido = finalizar;
    if (pular) {
        pular.disabled = false;
        pular.addEventListener("click", finalizar);
    }

    statusEl.textContent = "1º TEMPO";
    comentarioEl.textContent = "Bola rolando!";
    adicionarEventoPartida("<strong>00' ▶ Início da partida</strong>");

    intervaloPartida = window.setInterval(() => {
        minuto += 1;
        minutoEl.textContent = `${String(minuto).padStart(2, "0")}'`;

        const indiceAntes = indiceEvento;
        revelarEventosAte(minuto);
        const teveGol = indiceEvento > indiceAntes;

        if (!teveGol && comentarios.has(minuto)) {
            comentarioEl.textContent = comentarios.get(minuto);
        }

        if (minuto === 45) {
            statusEl.textContent = "INTERVALO";
            adicionarEventoPartida("<strong>45' ⏱ Intervalo</strong>");
        } else if (minuto === 46) {
            statusEl.textContent = "2º TEMPO";
            comentarioEl.textContent = "Começa a segunda etapa.";
        }

        if (minuto >= 90) {
            finalizar();
        }
    }, 280);
}

function renderizarGols() {
    const corpo = document.querySelector("#lista-gols");

    if (!estado.gols.length) {
        corpo.innerHTML = '<tr><td colspan="4">Nenhum gol cadastrado.</td></tr>';
        return;
    }

    const gols = [...estado.gols].sort((a, b) => a.minuto - b.minuto);

    corpo.innerHTML = gols.map((gol) => {
        const jogador = jogadorPorId(gol.id_jogador);
        const partida = partidaPorId(gol.id_partida);

        return `
            <tr>
                <td><span class="goal-minute">${gol.minuto}'</span></td>
                <td><strong>${valorOuTraco(jogador?.nome)}</strong></td>
                <td>${escapar(rotuloPartida(partida))}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-ghost btn-small" data-editar-gol="${gol.id}">Editar</button>
                        <button class="btn btn-danger btn-small" data-apagar-gol="${gol.id}">Excluir</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
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


function formularioCampeonato(campeonato = null) {
    abrirModal(`
        <span class="eyebrow">Competição</span>
        <h2>${campeonato ? "Editar campeonato" : "Novo campeonato"}</h2>
        <p class="modal-intro">Cadastre o torneio e a temporada disputada.</p>
        <form id="form-campeonato">
            <div class="form-grid">
                <div class="form-group full">
                    <label for="campeonato-nome">Nome</label>
                    <input id="campeonato-nome" name="nome" required value="${escapar(campeonato?.nome || "")}">
                </div>
                <div class="form-group full">
                    <label for="campeonato-temporada">Temporada</label>
                    <input id="campeonato-temporada" name="temporada" type="number" min="1900" max="2200" required value="${campeonato?.temporada ?? new Date().getFullYear()}">
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-ghost" data-fechar-modal>Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
        </form>
    `);

    document.querySelector("#form-campeonato").addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const form = new FormData(evento.currentTarget);
        const dados = {
            nome: form.get("nome").trim(),
            temporada: Number(form.get("temporada")),
        };

        await salvar(async () => {
            if (campeonato) {
                await api.editarCampeonato(campeonato.id, dados);
            } else {
                await api.criarCampeonato(dados);
            }
        }, "Campeonato salvo com sucesso.");
    });
}

function opcoesPartidas(selecionado) {
    return [
        '<option value="">Selecione uma partida</option>',
        ...estado.partidas.map((partida) => `
            <option value="${partida.id}" ${Number(selecionado) === partida.id ? "selected" : ""}>
                ${escapar(rotuloPartida(partida))} • ${formatarData(partida.data_partida)}
            </option>
        `),
    ].join("");
}

function formularioPartida(partida = null) {
    abrirModal(`
        <span class="eyebrow">Confronto</span>
        <h2>${partida ? "Editar partida" : "Nova partida"}</h2>
        <p class="modal-intro">Defina o confronto. O placar e os gols ficam sincronizados com os eventos registrados.</p>
        <form id="form-partida">
            <div class="form-grid">
                <div class="form-group full">
                    <label for="partida-data">Data e hora</label>
                    <input id="partida-data" name="data_partida" type="datetime-local" required value="${valorDatetimeLocal(partida?.data_partida)}">
                </div>
                <div class="form-group full">
                    <label for="partida-campeonato">Campeonato</label>
                    <select id="partida-campeonato" name="id_campeonato" required>
                        ${opcoes(estado.campeonatos, partida?.id_campeonato, "um campeonato")}
                    </select>
                </div>
                <div class="form-group">
                    <label for="partida-mandante">Mandante</label>
                    <select id="partida-mandante" name="id_mandante" required>
                        ${opcoes(estado.clubes, partida?.id_mandante, "o mandante")}
                    </select>
                </div>
                <div class="form-group">
                    <label for="partida-visitante">Visitante</label>
                    <select id="partida-visitante" name="id_visitante" required>
                        ${opcoes(estado.clubes, partida?.id_visitante, "o visitante")}
                    </select>
                </div>
                ${partida ? `
                    <div class="form-group">
                        <label for="partida-gols-mandante">Gols mandante</label>
                        <input id="partida-gols-mandante" name="gols_mandante" type="number" min="0" required value="${partida.gols_mandante ?? 0}">
                    </div>
                    <div class="form-group">
                        <label for="partida-gols-visitante">Gols visitante</label>
                        <input id="partida-gols-visitante" name="gols_visitante" type="number" min="0" required value="${partida.gols_visitante ?? 0}">
                    </div>
                ` : `
                    <div class="form-note full">
                        <span>⚽</span>
                        <div>
                            <strong>A partida começa em 0 × 0</strong>
                            <small>Os gols serão gravados no banco quando o jogo for simulado.</small>
                        </div>
                    </div>
                `}
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-ghost" data-fechar-modal>Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
        </form>
    `);

    document.querySelector("#form-partida").addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const form = new FormData(evento.currentTarget);
        const idMandante = Number(form.get("id_mandante"));
        const idVisitante = Number(form.get("id_visitante"));

        if (idMandante === idVisitante) {
            toast("Mandante e visitante precisam ser clubes diferentes.", true);
            return;
        }

        const dados = {
            data_partida: form.get("data_partida"),
            id_campeonato: Number(form.get("id_campeonato")),
            id_mandante: idMandante,
            id_visitante: idVisitante,
            gols_mandante: partida ? Number(form.get("gols_mandante")) : 0,
            gols_visitante: partida ? Number(form.get("gols_visitante")) : 0,
        };

        await salvar(async () => {
            if (partida) {
                await api.editarPartida(partida.id, dados);
            } else {
                await api.criarPartida(dados);
            }
        }, "Partida salva com sucesso.");
    });
}

function opcoesJogadoresDaPartida(idPartida, selecionado = null) {
    const partida = partidaPorId(idPartida);

    if (!partida) {
        return '<option value="">Selecione uma partida primeiro</option>';
    }

    const jogadores = estado.jogadores.filter((jogador) =>
        [partida.id_mandante, partida.id_visitante].includes(
            jogador.clube?.id ?? jogador.id_clube,
        ),
    );

    return [
        '<option value="">Selecione o autor do gol</option>',
        ...jogadores.map((jogador) => `
            <option value="${jogador.id}" ${Number(selecionado) === jogador.id ? "selected" : ""}>
                ${escapar(jogador.nome)} • ${escapar(jogador.clube?.nome || "Clube")}
            </option>
        `),
    ].join("");
}

function formularioGol(gol = null) {
    const partidaInicial = gol?.id_partida || "";

    abrirModal(`
        <span class="eyebrow">Gol</span>
        <h2>${gol ? "Editar gol" : "Novo gol"}</h2>
        <p class="modal-intro">Registre um lance real da partida. O placar será recalculado automaticamente.</p>
        <form id="form-gol">
            <div class="form-grid">
                <div class="form-group full">
                    <label for="gol-partida">Partida</label>
                    <select id="gol-partida" name="id_partida" required>
                        ${opcoesPartidas(gol?.id_partida)}
                    </select>
                </div>
                <div class="form-group">
                    <label for="gol-jogador">Jogador</label>
                    <select id="gol-jogador" name="id_jogador" required>
                        ${opcoesJogadoresDaPartida(partidaInicial, gol?.id_jogador)}
                    </select>
                </div>
                <div class="form-group">
                    <label for="gol-minuto">Minuto</label>
                    <input id="gol-minuto" name="minuto" type="number" min="0" max="130" required value="${gol?.minuto ?? ""}">
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-ghost" data-fechar-modal>Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
        </form>
    `);

    const partidaSelect = document.querySelector("#gol-partida");
    const jogadorSelect = document.querySelector("#gol-jogador");

    partidaSelect.addEventListener("change", () => {
        jogadorSelect.innerHTML = opcoesJogadoresDaPartida(
            Number(partidaSelect.value),
        );
    });

    document.querySelector("#form-gol").addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const form = new FormData(evento.currentTarget);
        const dados = {
            minuto: Number(form.get("minuto")),
            id_partida: Number(form.get("id_partida")),
            id_jogador: Number(form.get("id_jogador")),
        };

        await salvar(async () => {
            if (gol) {
                await api.editarGol(gol.id, dados);
            } else {
                await api.criarGol(dados);
            }
        }, "Gol salvo com sucesso.");
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

async function confirmarExclusao(tipo, item, operacao, rotulo = null) {
    const nome = rotulo || item.nome || `#${item.id}`;
    const aceitou = window.confirm(`Excluir ${tipo} "${nome}"?`);
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

    if (alvo.dataset.competitionTab) {
        const aba = alvo.dataset.competitionTab;
        document.querySelectorAll("[data-competition-tab]").forEach((botao) => {
            botao.classList.toggle("active", botao.dataset.competitionTab === aba);
        });
        document.querySelectorAll("[data-competition-panel]").forEach((painel) => {
            painel.classList.toggle("active", painel.dataset.competitionPanel === aba);
        });
    }

    if (alvo.dataset.fecharModal !== undefined) {
        fecharModal();
    }

    const encontrar = (lista, id) => lista.find((item) => item.id === Number(id));

    if (alvo.dataset.action === "novo-tecnico") formularioTecnico();
    if (alvo.dataset.action === "novo-estadio") formularioEstadio();
    if (alvo.dataset.action === "novo-clube") formularioClube();
    if (alvo.dataset.action === "novo-jogador") formularioJogador();
    if (alvo.dataset.action === "novo-campeonato") formularioCampeonato();
    if (alvo.dataset.action === "nova-partida") formularioPartida();
    if (alvo.dataset.action === "novo-gol") formularioGol();

    if (alvo.dataset.verClube) {
        detalheClube(encontrar(estado.clubes, alvo.dataset.verClube));
    }

    if (alvo.dataset.jogarPartida) {
        jogarPartida(Number(alvo.dataset.jogarPartida));
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
    if (alvo.dataset.editarCampeonato) {
        formularioCampeonato(
            encontrar(estado.campeonatos, alvo.dataset.editarCampeonato),
        );
    }
    if (alvo.dataset.editarPartida) {
        formularioPartida(encontrar(estado.partidas, alvo.dataset.editarPartida));
    }
    if (alvo.dataset.editarGol) {
        formularioGol(encontrar(estado.gols, alvo.dataset.editarGol));
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
    if (alvo.dataset.apagarCampeonato) {
        const item = encontrar(estado.campeonatos, alvo.dataset.apagarCampeonato);
        confirmarExclusao(
            "Campeonato",
            item,
            () => api.apagarCampeonato(item.id),
        );
    }
    if (alvo.dataset.apagarPartida) {
        const item = encontrar(estado.partidas, alvo.dataset.apagarPartida);
        confirmarExclusao(
            "Partida",
            item,
            () => api.apagarPartida(item.id),
            rotuloPartida(item),
        );
    }
    if (alvo.dataset.apagarGol) {
        const item = encontrar(estado.gols, alvo.dataset.apagarGol);
        const jogador = jogadorPorId(item.id_jogador);
        confirmarExclusao(
            "Gol",
            item,
            () => api.apagarGol(item.id),
            `${item.minuto}' • ${jogador?.nome || `Jogador #${item.id_jogador}`}`,
        );
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

document.querySelector("#home-campeonato-select")?.addEventListener("change", (evento) => {
    campeonatoHomeSelecionado = Number(evento.target.value);
    renderizarTabelaCampeonatoHome();
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
