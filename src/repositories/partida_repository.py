import random
from typing import List, Optional

from src.database.conexao import conectar
from src.schemas.partida_schema import Partida, PartidaAtualizar, PartidaCriar


def listar() -> List[Partida]:
    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    data_partida,
                    id_campeonato,
                    id_mandante,
                    id_visitante,
                    gols_mandante,
                    gols_visitante
                FROM partidas
                """
            )
            registros = cursor.fetchall()

    partidas = []
    for registro in registros:
        partida = Partida(
            id=registro[0],
            data_partida=registro[1],
            id_campeonato=registro[2],
            id_mandante=registro[3],
            id_visitante=registro[4],
            gols_mandante=registro[5],
            gols_visitante=registro[6],
        )
        partidas.append(partida)

    return partidas


def buscar_por_id(id: int) -> Optional[Partida]:
    sql = """
        SELECT
            id,
            data_partida,
            id_campeonato,
            id_mandante,
            id_visitante,
            gols_mandante,
            gols_visitante
        FROM partidas
        WHERE id = %s
    """

    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(sql, (id,))
            registro = cursor.fetchone()

    if registro is None:
        return None

    return Partida(
        id=registro[0],
        data_partida=registro[1],
        id_campeonato=registro[2],
        id_mandante=registro[3],
        id_visitante=registro[4],
        gols_mandante=registro[5],
        gols_visitante=registro[6],
    )


def _peso_posicao(posicao: str | None) -> float:
    """Define a chance relativa de um jogador ser sorteado como autor do gol."""
    texto = (posicao or "").strip().lower()

    if "atac" in texto or "ponta" in texto:
        return 5.0
    if "meia" in texto:
        return 3.6
    if "lateral" in texto:
        return 1.8
    if "zague" in texto or "defen" in texto:
        return 1.4
    if "gole" in texto:
        return 0.2

    return 2.2


def _buscar_jogadores(cursor, id_clube: int) -> list[dict]:
    cursor.execute(
        """
        SELECT
            id,
            nome,
            posicao,
            id_clube
        FROM jogadores
        WHERE id_clube = %s
        """,
        (id_clube,),
    )

    return [
        {
            "id": registro[0],
            "nome": registro[1],
            "posicao": registro[2],
            "id_clube": registro[3],
        }
        for registro in cursor.fetchall()
    ]


def _minutos_para_gols(total: int) -> list[int]:
    if total <= 0:
        return []

    minutos_disponiveis = list(range(3, 91))
    if total <= len(minutos_disponiveis):
        return sorted(random.sample(minutos_disponiveis, total))

    return sorted(random.choices(minutos_disponiveis, k=total))


def _contar_gols_por_clube(cursor, id_partida: int) -> dict[int, int]:
    cursor.execute(
        """
        SELECT
            jogadores.id_clube,
            COUNT(*)
        FROM gols
        INNER JOIN jogadores
            ON gols.id_jogador = jogadores.id
        WHERE gols.id_partida = %s
        GROUP BY jogadores.id_clube
        """,
        (id_partida,),
    )

    return {
        registro[0]: registro[1]
        for registro in cursor.fetchall()
    }


def _sincronizar_gols_partida(
    cursor,
    id_partida: int,
    id_mandante: int,
    id_visitante: int,
    gols_mandante: int,
    gols_visitante: int,
) -> dict:
    """Garante que o placar da partida possua gols reais na tabela `gols`."""
    gols_mandante = max(0, int(gols_mandante or 0))
    gols_visitante = max(0, int(gols_visitante or 0))

    contagem = _contar_gols_por_clube(cursor, id_partida)
    contagem_mandante = contagem.get(id_mandante, 0)
    contagem_visitante = contagem.get(id_visitante, 0)
    outros_gols = sum(
        quantidade
        for clube, quantidade in contagem.items()
        if clube not in {id_mandante, id_visitante}
    )

    if (
        contagem_mandante == gols_mandante
        and contagem_visitante == gols_visitante
        and outros_gols == 0
    ):
        return {
            "alterada": False,
            "gols": gols_mandante + gols_visitante,
            "motivo": None,
        }

    jogadores_mandante = _buscar_jogadores(cursor, id_mandante)
    jogadores_visitante = _buscar_jogadores(cursor, id_visitante)

    if gols_mandante > 0 and not jogadores_mandante:
        return {
            "alterada": False,
            "gols": contagem_mandante + contagem_visitante,
            "motivo": "Clube mandante sem jogadores cadastrados",
        }

    if gols_visitante > 0 and not jogadores_visitante:
        return {
            "alterada": False,
            "gols": contagem_mandante + contagem_visitante,
            "motivo": "Clube visitante sem jogadores cadastrados",
        }

    cursor.execute("DELETE FROM gols WHERE id_partida = %s", (id_partida,))

    lados = ["mandante"] * gols_mandante
    lados += ["visitante"] * gols_visitante
    random.shuffle(lados)

    minutos = _minutos_para_gols(len(lados))

    for minuto, lado in zip(minutos, lados):
        elenco = jogadores_mandante if lado == "mandante" else jogadores_visitante
        pesos = [_peso_posicao(jogador["posicao"]) for jogador in elenco]
        autor = random.choices(elenco, weights=pesos, k=1)[0]

        cursor.execute(
            """
            INSERT INTO gols (
                minuto,
                id_partida,
                id_jogador
            )
            VALUES (%s, %s, %s)
            """,
            (minuto, id_partida, autor["id"]),
        )

    return {
        "alterada": True,
        "gols": len(lados),
        "motivo": None,
    }


def sincronizar_gols() -> dict:
    """Sincroniza partidas antigas cujo placar não possui gols correspondentes."""
    sql = """
        SELECT
            id,
            id_mandante,
            id_visitante,
            gols_mandante,
            gols_visitante
        FROM partidas
    """

    sincronizadas = 0
    avisos = []

    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(sql)
            partidas = cursor.fetchall()

            for partida in partidas:
                resultado = _sincronizar_gols_partida(
                    cursor=cursor,
                    id_partida=partida[0],
                    id_mandante=partida[1],
                    id_visitante=partida[2],
                    gols_mandante=partida[3],
                    gols_visitante=partida[4],
                )

                if resultado["alterada"]:
                    sincronizadas += 1

                if resultado["motivo"]:
                    avisos.append(
                        {
                            "id_partida": partida[0],
                            "mensagem": resultado["motivo"],
                        }
                    )

            conexao.commit()

    return {
        "partidas_analisadas": len(partidas),
        "partidas_sincronizadas": sincronizadas,
        "avisos": avisos,
    }


def jogador_participa_da_partida(id_partida: int, id_jogador: int) -> bool:
    sql = """
        SELECT 1
        FROM partidas
        INNER JOIN jogadores
            ON jogadores.id = %s
        WHERE partidas.id = %s
          AND jogadores.id_clube IN (
              partidas.id_mandante,
              partidas.id_visitante
          )
        LIMIT 1
    """

    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(sql, (id_jogador, id_partida))
            return cursor.fetchone() is not None


def cadastrar(partida: PartidaCriar) -> Partida:
    sql = """
        INSERT INTO partidas (
            data_partida,
            id_campeonato,
            id_mandante,
            id_visitante,
            gols_mandante,
            gols_visitante
        )
        VALUES (%s, %s, %s, %s, %s, %s)
    """

    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                sql,
                (
                    partida.data_partida,
                    partida.id_campeonato,
                    partida.id_mandante,
                    partida.id_visitante,
                    partida.gols_mandante,
                    partida.gols_visitante,
                ),
            )
            novo_id = cursor.lastrowid

            _sincronizar_gols_partida(
                cursor=cursor,
                id_partida=novo_id,
                id_mandante=partida.id_mandante,
                id_visitante=partida.id_visitante,
                gols_mandante=partida.gols_mandante,
                gols_visitante=partida.gols_visitante,
            )
            conexao.commit()

    return Partida(
        id=novo_id,
        data_partida=partida.data_partida,
        id_campeonato=partida.id_campeonato,
        id_mandante=partida.id_mandante,
        id_visitante=partida.id_visitante,
        gols_mandante=partida.gols_mandante,
        gols_visitante=partida.gols_visitante,
    )


def atualizar(id: int, partida: PartidaAtualizar):
    sql = """
        UPDATE partidas
        SET
            data_partida = %s,
            id_campeonato = %s,
            id_mandante = %s,
            id_visitante = %s,
            gols_mandante = %s,
            gols_visitante = %s
        WHERE id = %s
    """

    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                sql,
                (
                    partida.data_partida,
                    partida.id_campeonato,
                    partida.id_mandante,
                    partida.id_visitante,
                    partida.gols_mandante,
                    partida.gols_visitante,
                    id,
                ),
            )

            _sincronizar_gols_partida(
                cursor=cursor,
                id_partida=id,
                id_mandante=partida.id_mandante,
                id_visitante=partida.id_visitante,
                gols_mandante=partida.gols_mandante,
                gols_visitante=partida.gols_visitante,
            )
            conexao.commit()


def excluir(id: int):
    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute("DELETE FROM gols WHERE id_partida = %s", (id,))
            cursor.execute("DELETE FROM partidas WHERE id = %s", (id,))
            conexao.commit()


def _sortear_quantidade_gols(mandante: bool) -> int:
    valores = [0, 1, 2, 3, 4, 5]
    pesos_mandante = [14, 28, 30, 18, 7, 3]
    pesos_visitante = [20, 31, 27, 15, 5, 2]
    pesos = pesos_mandante if mandante else pesos_visitante
    return random.choices(valores, weights=pesos, k=1)[0]


def simular(id: int) -> dict | None:
    """Simula uma partida e grava o placar e cada gol no banco de dados."""
    sql_partida = """
        SELECT
            partidas.id,
            partidas.data_partida,
            partidas.id_campeonato,
            partidas.id_mandante,
            mandantes.nome,
            partidas.id_visitante,
            visitantes.nome
        FROM partidas
        INNER JOIN clubes AS mandantes
            ON partidas.id_mandante = mandantes.id
        INNER JOIN clubes AS visitantes
            ON partidas.id_visitante = visitantes.id
        WHERE partidas.id = %s
    """

    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(sql_partida, (id,))
            registro = cursor.fetchone()

            if registro is None:
                return None

            id_mandante = registro[3]
            nome_mandante = registro[4]
            id_visitante = registro[5]
            nome_visitante = registro[6]

            jogadores_mandante = _buscar_jogadores(cursor, id_mandante)
            jogadores_visitante = _buscar_jogadores(cursor, id_visitante)

            if not jogadores_mandante:
                raise ValueError(
                    f"{nome_mandante} não possui jogadores cadastrados para a simulação"
                )

            if not jogadores_visitante:
                raise ValueError(
                    f"{nome_visitante} não possui jogadores cadastrados para a simulação"
                )

            gols_mandante = _sortear_quantidade_gols(mandante=True)
            gols_visitante = _sortear_quantidade_gols(mandante=False)
            total_gols = gols_mandante + gols_visitante

            minutos = _minutos_para_gols(total_gols)
            lados = ["mandante"] * gols_mandante
            lados += ["visitante"] * gols_visitante
            random.shuffle(lados)

            cursor.execute("DELETE FROM gols WHERE id_partida = %s", (id,))

            eventos = []
            placar_mandante = 0
            placar_visitante = 0

            for minuto, lado in zip(minutos, lados):
                if lado == "mandante":
                    elenco = jogadores_mandante
                    id_clube = id_mandante
                    nome_clube = nome_mandante
                    placar_mandante += 1
                else:
                    elenco = jogadores_visitante
                    id_clube = id_visitante
                    nome_clube = nome_visitante
                    placar_visitante += 1

                pesos = [_peso_posicao(jogador["posicao"]) for jogador in elenco]
                autor = random.choices(elenco, weights=pesos, k=1)[0]

                cursor.execute(
                    """
                    INSERT INTO gols (
                        minuto,
                        id_partida,
                        id_jogador
                    )
                    VALUES (%s, %s, %s)
                    """,
                    (minuto, id, autor["id"]),
                )

                eventos.append(
                    {
                        "minuto": minuto,
                        "lado": lado,
                        "id_clube": id_clube,
                        "clube": nome_clube,
                        "id_jogador": autor["id"],
                        "jogador": autor["nome"],
                        "placar_mandante": placar_mandante,
                        "placar_visitante": placar_visitante,
                    }
                )

            cursor.execute(
                """
                UPDATE partidas
                SET
                    gols_mandante = %s,
                    gols_visitante = %s
                WHERE id = %s
                """,
                (gols_mandante, gols_visitante, id),
            )
            conexao.commit()

    return {
        "partida": {
            "id": registro[0],
            "data_partida": registro[1],
            "id_campeonato": registro[2],
            "id_mandante": id_mandante,
            "mandante": nome_mandante,
            "id_visitante": id_visitante,
            "visitante": nome_visitante,
            "gols_mandante": gols_mandante,
            "gols_visitante": gols_visitante,
        },
        "eventos": eventos,
    }
