from src.database.conexao import conectar
from src.schemas.clube_schema import Clube, ClubeCadastro, ClubeEditar
from src.schemas.estadio_schema import Estadio
from src.schemas.tecnico_schema import Tecnico


def cadastrar(clube: ClubeCadastro) -> Clube:
    """Responsável por cadastrar os clubes."""
    sql = """
    INSERT INTO clubes (
        nome,
        cidade,
        estado,
        ano_fundacao,
        id_tecnico,
        id_estadio
    )
    VALUES (%s, %s, %s, %s, %s, %s)
    """

    with conectar() as conexao, conexao.cursor() as cursor:
        cursor.execute(
            sql,
            (
                clube.nome,
                clube.cidade,
                clube.estado,
                clube.ano_fundacao,
                clube.id_tecnico,
                clube.id_estadio,
            ),
        )

        novo_id = cursor.lastrowid

        conexao.commit()

    return consultar_por_id(novo_id)


def consultar_todos() -> list[Clube]:
    """Responsável por consultar todos os clubes."""
    sql = """
    SELECT
        clubes.id,
        clubes.nome,
        clubes.cidade,
        clubes.estado,
        clubes.ano_fundacao,

        tecnicos.id,
        tecnicos.nome,
        tecnicos.nacionalidade,
        tecnicos.data_nascimento,

        estadios.id,
        estadios.nome,
        estadios.cidade,
        estadios.estado,
        estadios.capacidade

    FROM clubes

    INNER JOIN tecnicos
        ON clubes.id_tecnico = tecnicos.id

    INNER JOIN estadios
        ON clubes.id_estadio = estadios.id;
    """

    with conectar() as conexao, conexao.cursor() as cursor:
        cursor.execute(sql)
        registros = cursor.fetchall()

    clubes: list[Clube] = []

    for registro in registros:
        tecnico: Tecnico = Tecnico(
            id=registro[5],
            nome=registro[6],
            nacionalidade=registro[7],
            data_nascimento=registro[8],
        )

        estadio: Estadio = Estadio(
            id=registro[9],
            nome=registro[10],
            cidade=registro[11],
            estado=registro[12],
            capacidade=registro[13],
        )

        clube: Clube = Clube(
            id=registro[0],
            nome=registro[1],
            cidade=registro[2],
            estado=registro[3],
            ano_fundacao=registro[4],
            tecnico=tecnico,
            estadio=estadio,
        )

        clubes.append(clube)

    return clubes


def consultar_por_id(id: int) -> Clube | None:
    """Responsável por consultar um clube pelo ID."""
    sql = """
    SELECT
        clubes.id,
        clubes.nome,
        clubes.cidade,
        clubes.estado,
        clubes.ano_fundacao,

        tecnicos.id,
        tecnicos.nome,
        tecnicos.nacionalidade,
        tecnicos.data_nascimento,

        estadios.id,
        estadios.nome,
        estadios.cidade,
        estadios.estado,
        estadios.capacidade

    FROM clubes

    INNER JOIN tecnicos
        ON clubes.id_tecnico = tecnicos.id

    INNER JOIN estadios
        ON clubes.id_estadio = estadios.id

    WHERE clubes.id = %s;
    """

    with conectar() as conexao, conexao.cursor() as cursor:
        cursor.execute(sql, (id,))
        registro = cursor.fetchone()

    if registro is None:
        return None

    tecnico: Tecnico = Tecnico(
        id=registro[5],
        nome=registro[6],
        nacionalidade=registro[7],
        data_nascimento=registro[8],
    )

    estadio: Estadio = Estadio(
        id=registro[9],
        nome=registro[10],
        cidade=registro[11],
        estado=registro[12],
        capacidade=registro[13],
    )

    clube: Clube = Clube(
        id=registro[0],
        nome=registro[1],
        cidade=registro[2],
        estado=registro[3],
        ano_fundacao=registro[4],
        tecnico=tecnico,
        estadio=estadio,
    )

    return clube


def editar(id: int, clube: ClubeEditar):
    """Responsável por editar o cadastro dos clubes."""
    sql = """
    UPDATE clubes
    SET
        nome = %s,
        cidade = %s,
        estado = %s,
        ano_fundacao = %s,
        id_tecnico = %s,
        id_estadio = %s
    WHERE id = %s;
    """

    with conectar() as conexao, conexao.cursor() as cursor:
        cursor.execute(
            sql,
            (
                clube.nome,
                clube.cidade,
                clube.estado,
                clube.ano_fundacao,
                clube.id_tecnico,
                clube.id_estadio,
                id,
            ),
        )

        conexao.commit()


def apagar(id: int):
    """Responsável por apagar um clube."""
    sql = """
    DELETE FROM clubes
    WHERE id = %s;
    """

    with conectar() as conexao, conexao.cursor() as cursor:
        cursor.execute(sql, (id,))
        conexao.commit()
