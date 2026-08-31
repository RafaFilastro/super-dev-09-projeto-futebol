from src.database.conexao import conectar
from src.schemas.tecnico_schema import Tecnico, TecnicoCadastro, TecnicoEditar


def cadastrar(tecnico: TecnicoCadastro) -> Tecnico:
    """Responsável por listar todos os Técnicos."""
    sql = """
    INSERT INTO tecnicos (
        nome,
        nacionalidade,
        data_nascimento
    )
    VALUES (%s, %s, %s)
    """
    with conectar() as conexao:
        cursor = conexao.cursor()
        cursor.execute(
            sql,
            (
                tecnico.nome,
                tecnico. nacionalidade,
                tecnico.data_nascimento
            ),
        )

        novo_id = cursor.lastrowid

        conexao.commit()

    return Tecnico(
       id=novo_id,
       nome=tecnico.nome,
       nacionalidade=tecnico.nacionalidade,
       data_nascimento=tecnico.data_nascimento,
    )


def consultar_todos() -> list[Tecnico]:
    """Responsável por consultar todos os Técnicos"""
    sql = """
    SELECT
        id,
        nome,
        nacionalidade,
        data_nascimento
    FROM tecnicos;
    """
    with conectar() as conexao, conexao.cursor() as cursor:
        cursor.execute(sql)
        registros = cursor.fetchall()

    tecnicos: list[Tecnico] = []
    for registro in registros:
        tecnico: Tecnico = Tecnico(
            id=registro[0],
            nome=registro[1],
            nacionalidade=registro[2],
            data_nascimento=registro[3],
        )

        tecnicos.append(tecnico)

    return tecnicos


def editar(id: int, tecnico: TecnicoEditar):
    """Responsável por editar o cadastro do Técnico."""
    sql = """
    UPDATE tecnicos
    SET
        nome = %s,
        nacionalidade = %s,
        data_nascimento = %s
    WHERE id = %s;
    """
    with conectar() as conexao, conexao.cursor() as cursor:
        cursor.execute(
            sql,
            (
                tecnico.nome,
                tecnico.nacionalidade,
                tecnico.data_nascimento,
                id,
            ),
        )
        conexao.commit()


def consultar_por_id(id: int) -> Tecnico | None:
    """Responsável por consultar os Técnicos incluindo sua categoria por id"""
    sql = """
    SELECT
        id,
        nome,
        nacionalidade,
        data_nascimento
    FROM tecnicos
    WHERE id = %s;
    """

    with conectar() as conexao, conexao.cursor() as cursor:
        cursor.execute(sql, (id,))
        registro = cursor.fetchone()

    if registro is None:
        return None

    tecnico: Tecnico = Tecnico(
        id=registro[0],
        nome=registro[1],
        nacionalidade=registro[2],
        data_nascimento=registro[3],
    )

    return tecnico

def apagar(id: int):
    """Responsável por apagar o cadastro do Técnico."""
    sql = "DELETE FROM tecnicos WHERE id = %s"
    with conectar() as conexao, conexao.cursor() as cursor:
        cursor.execute(sql, (id,))
        conexao.commit()
