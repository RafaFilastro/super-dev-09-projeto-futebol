from src.database.conexao import conectar
from src.schemas.estadio_schema import Estadio, EstadioCadastro, EstadioEditar


def cadastrar(estadio: EstadioCadastro) -> Estadio:
    """Responsável por cadastrar os Estádios."""
    sql = """
    INSERT INTO estadios (
        nome,
        cidade,
        estado,
        capacidade
    )
    VALUES (%s, %s, %s, %s)
    """
    with conectar() as conexao:
        cursor = conexao.cursor()
        cursor.execute(
            sql,
            (
                estadio.nome,
                estadio.cidade,
                estadio.estado,
                estadio.capacidade
            ),
        )

        novo_id = cursor.lastrowid

        conexao.commit()

    return Estadio(
        id=novo_id,
        nome=estadio.nome,
        cidade=estadio.cidade,
        estado=estadio.estado,
        capacidade=estadio.capacidade,
    )

def consultar_todos() -> list[Estadio]:
    """Responsável por consultar todos os Estádios."""
    sql = """
    SELECT
        id,
        nome,
        cidade,
        estado,
        capacidade
    FROM estadios;
    """
    with conectar() as conexao, conexao.cursor() as cursor:
        cursor.execute(sql)
        registros = cursor.fetchall()

    estadios: list[Estadio] = []
    for registro in registros:
        estadio: Estadio = Estadio(
            id=registro[0],
            nome=registro[1],
            cidade=registro[2],
            estado=registro[3],
            capacidade=registro[4],
        )

        estadios.append(estadio)

    return estadios

def editar(id: int, estadio: EstadioEditar):
    """Responsável por editar o cadastro do Estádio."""
    sql = """
    UPDATE estadios
    set
        nome = %s,
        cidade = %s,
        estado = %s,
        capacidade = %s
    WHERE id = %s;
    """
    with conectar() as conexao, conexao.cursor() as cursor:
        cursor.execute(
            sql,
            (
                estadio.nome,
                estadio.cidade,
                estadio.estado,
                estadio.capacidade,
                id,
            ),
        )
        conexao.commit()

def consultar_por_id(id: int) -> Estadio | None:
    """Responsável por consultar o Estádio pelo seu id"""
    sql = """
    SELECT
        id,
        nome,
        cidade,
        estado,
        capacidade
    FROM estadios
    WHERE id = %s;
    """

    with conectar() as conexao, conexao.cursor() as cursor:
        cursor.execute(sql, (id,))
        registro = cursor.fetchone()

    if registro is None:
        return None

    estadio: Estadio = Estadio(
        id=registro[0],
        nome=registro[1],
        cidade=registro[2],
        estado=registro[3],
        capacidade=registro[4],
    )

    return estadio

def apagar(id: int):
    """Responsável por apagar o cadastro do Estádio."""
    sql = "DELETE FROM estadios WHERE id = %s"
    with conectar() as conexao, conexao.cursor() as cursor:
        cursor.execute(sql, (id,))
        conexao.commit()
