from typing import List, Optional

from src.database.conexao import conectar
from src.schemas.campeonato_schema import Campeonato, CampeonatoCriar, CampeonatoAtualizar


def listar() -> List[Campeonato]:
    """Listar todos os campeonatos"""
    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute("SELECT id, nome, temporada FROM campeonatos")
            registros = cursor.fetchall()

            campeonatos = []
            for registro in registros:
                campeonato = Campeonato(id=registro[0], nome=registro[1], temporada=registro[2])
                campeonatos.append(campeonato)
            return campeonatos


def buscar_por_id(id: int) -> Optional[Campeonato]:
    """Buscar o campeonato por id"""
    sql = "SELECT id, nome, temporada FROM campeonatos WHERE id = %s"
    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(sql, (id,))
            registro = cursor.fetchone()
            if registro is None:
                return None
            return Campeonato(id= registro[0], nome=registro[1],temporada=registro[2])


def cadastrar(campeonato: CampeonatoCriar) -> Campeonato:
    """Cadastrar um novo campeonato"""
    sql = "INSERT INTO campeonatos (nome, temporada) VALUES (%s,%s)"
    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(sql, (campeonato.nome, campeonato.temporada))
            novo_id = cursor.lastrowid
            conexao.commit()
            return Campeonato(id=novo_id, nome=campeonato.nome, temporada=campeonato.temporada)


def atualizar(id: int, campeonato: CampeonatoAtualizar):
    """Atualiza o campeonato existente"""
    sql = "UPDATE campeonatos SET nome = %s, temporada = %s WHERE id = %s"
    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(sql, (campeonato.nome, campeonato.temporada, id))
            conexao.commit()


def excluir(id: int):
    """Exclui o campeonato existente"""
    sql = "DELETE FROM campeonatos WHERE id = %s"
    with conectar() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(sql, (id,))
            conexao.commit()

