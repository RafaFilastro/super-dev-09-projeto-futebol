from typing import List, Optional

from src.database.conexao import conectar
from src.schemas.gol_schema import Gol, GolCriar, GolAtualizar

def listar() -> List[Gol]:
    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute("""
                SELECT
                    id,
                    minuto,
                    id_partida,
                    id_jogador
                FROM gols
            """)
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
                sql,
                (
                    gol.minuto,
                    gol.id_partida,
                    gol.id_jogador,
                    id,
                ),
            )
            conexao.commit()


def excluir(id: int):
    sql = "DELETE FROM gols WHERE id = %s"

    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(sql, (id,))
            conexao.commit()