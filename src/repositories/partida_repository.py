from typing import List, Optional

from src.database.conexao import conectar
from src.schemas.partida_schema import Partida, PartidaCriar, PartidaAtualizar

def listar() -> List[Partida]:
    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute("""
                SELECT
                    id,
                    data_partida,
                    id_campeonato,
                    id_mandante,
                    id_visitante,
                    gols_mandante,
                    gols_visitante
                FROM partidas
            """)
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
            gols_visitante=registro[6]
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
            conexao.commit()


def excluir(id: int):
    sql = "DELETE FROM partidas WHERE id = %s"

    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(sql, (id,))
            conexao.commit()