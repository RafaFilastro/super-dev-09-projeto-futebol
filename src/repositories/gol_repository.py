from typing import List, Optional

from src.database.conexao import conectar
from src.schemas.gol_schema import Gol, GolAtualizar, GolCriar


def _atualizar_placar_partida(conexao, cursor, id_partida: int):
    """Recalcula o placar usando os gols realmente registrados no banco."""
    cursor.execute(
        """
        SELECT
            id_mandante,
            id_visitante
        FROM partidas
        WHERE id = %s
        """,
        (id_partida,),
    )
    partida = cursor.fetchone()

    if partida is None:
        return

    id_mandante, id_visitante = partida

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

    contagem = {
        registro[0]: registro[1]
        for registro in cursor.fetchall()
    }

    cursor.execute(
        """
        UPDATE partidas
        SET
            gols_mandante = %s,
            gols_visitante = %s
        WHERE id = %s
        """,
        (
            contagem.get(id_mandante, 0),
            contagem.get(id_visitante, 0),
            id_partida,
        ),
    )


def listar() -> List[Gol]:
    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    minuto,
                    id_partida,
                    id_jogador
                FROM gols
                """
            )
            registros = cursor.fetchall()

    gols = []
    for registro in registros:
        gol = Gol(
            id=registro[0],
            minuto=registro[1],
            id_partida=registro[2],
            id_jogador=registro[3],
        )
        gols.append(gol)

    return gols


def buscar_por_id(id: int) -> Optional[Gol]:
    sql = """
        SELECT
            id,
            minuto,
            id_partida,
            id_jogador
        FROM gols
        WHERE id = %s
    """

    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(sql, (id,))
            registro = cursor.fetchone()

    if registro is None:
        return None

    return Gol(
        id=registro[0],
        minuto=registro[1],
        id_partida=registro[2],
        id_jogador=registro[3],
    )


def cadastrar(gol: GolCriar) -> Gol:
    sql = """
        INSERT INTO gols (
            minuto,
            id_partida,
            id_jogador
        )
        VALUES (%s, %s, %s)
    """

    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                sql,
                (
                    gol.minuto,
                    gol.id_partida,
                    gol.id_jogador,
                ),
            )
            novo_id = cursor.lastrowid
            _atualizar_placar_partida(conexao, cursor, gol.id_partida)
            conexao.commit()

    return Gol(
        id=novo_id,
        minuto=gol.minuto,
        id_partida=gol.id_partida,
        id_jogador=gol.id_jogador,
    )


def atualizar(id: int, gol: GolAtualizar):
    sql = """
        UPDATE gols
        SET
            minuto = %s,
            id_partida = %s,
            id_jogador = %s
        WHERE id = %s
    """

    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                "SELECT id_partida FROM gols WHERE id = %s",
                (id,),
            )
            registro = cursor.fetchone()
            id_partida_anterior = registro[0] if registro else None

            cursor.execute(
                sql,
                (
                    gol.minuto,
                    gol.id_partida,
                    gol.id_jogador,
                    id,
                ),
            )

            if id_partida_anterior is not None:
                _atualizar_placar_partida(
                    conexao,
                    cursor,
                    id_partida_anterior,
                )

            if gol.id_partida != id_partida_anterior:
                _atualizar_placar_partida(
                    conexao,
                    cursor,
                    gol.id_partida,
                )

            conexao.commit()


def excluir(id: int):
    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                "SELECT id_partida FROM gols WHERE id = %s",
                (id,),
            )
            registro = cursor.fetchone()
            id_partida = registro[0] if registro else None

            cursor.execute("DELETE FROM gols WHERE id = %s", (id,))

            if id_partida is not None:
                _atualizar_placar_partida(
                    conexao,
                    cursor,
                    id_partida,
                )

            conexao.commit()
