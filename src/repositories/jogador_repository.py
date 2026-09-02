from src.database.conexao import conectar
from src.repositories import clube_repository
from src.schemas.clube_schema import Clube
from src.schemas.estadio_schema import Estadio
from src.schemas.jogador_schema import Jogador, JogadorCadastro, JogadorEditar
from src.schemas.tecnico_schema import Tecnico


def cadastrar(jogador: JogadorCadastro) -> Jogador:
    """Responsável por cadastrar os Jogadores."""
    sql = """
    INSERT INTO jogadores (
        nome,
        numero,
        posicao,
        data_nascimento,
        id_clube
    )
    VALUES (%s, %s, %s, %s, %s)
    """
    with conectar() as conexao:
        cursor = conexao.cursor()
        cursor.execute(
            sql,
            (
                jogador.nome,
                jogador.numero,
                jogador.posicao,
                jogador.data_nascimento,
                jogador.id_clube,
            ),
        )

        novo_id = cursor.lastrowid

        conexao.commit()
    clube = clube_repository.consultar_por_id(jogador.id_clube)

    return Jogador(
        id=novo_id,
        nome=jogador.nome,
        numero=jogador.numero,
        posicao=jogador.posicao,
        data_nascimento=jogador.data_nascimento,
        clube=clube,
    )


def consultar_todos() -> list[Jogador]:
    """Responsável por consultar todos os jogadores incluindo seu clube."""
    sql = """
    SELECT
        jogadores.id,
        jogadores.nome,
        jogadores.numero,
        jogadores.posicao,
        jogadores.data_nascimento,

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

    FROM jogadores

    INNER JOIN clubes
        ON jogadores.id_clube = clubes.id

    INNER JOIN tecnicos
        ON clubes.id_tecnico = tecnicos.id

    INNER JOIN estadios
        ON clubes.id_estadio = estadios.id;
    """

    with conectar() as conexao, conexao.cursor() as cursor:
        cursor.execute(sql)
        registros = cursor.fetchall()

    jogadores: list[Jogador] = []

    for registro in registros:
        tecnico: Tecnico = Tecnico(
            id=registro[10],
            nome=registro[11],
            nacionalidade=registro[12],
            data_nascimento=registro[13],
        )

        estadio: Estadio = Estadio(
            id=registro[14],
            nome=registro[15],
            cidade=registro[16],
            estado=registro[17],
            capacidade=registro[18],
        )

        clube: Clube = Clube(
            id=registro[5],
            nome=registro[6],
            cidade=registro[7],
            estado=registro[8],
            ano_fundacao=registro[9],
            tecnico=tecnico,
            estadio=estadio,
        )

        jogador: Jogador = Jogador(
            id=registro[0],
            nome=registro[1],
            numero=registro[2],
            posicao=registro[3],
            data_nascimento=registro[4],
            clube=clube,
        )

        jogadores.append(jogador)

    return jogadores

def editar(id: int, jogador: JogadorEditar):
    """Responsável por editar o cadastro dos Jogadores."""
    sql = """
    UPDATE jogadores
    SET
        nome = %s,
        numero = %s,
        posicao = %s,
        data_nascimento = %s,
        id_clube = %s
    WHERE id = %s;
    """
    with conectar() as conexao, conexao.cursor() as cursor:
        cursor.execute(
            sql,
            (
                jogador.nome,
                jogador.numero,
                jogador.posicao,
                jogador.data_nascimento,
                jogador.id_clube,
                id,
            ),
        )

        conexao.commit()

def consultar_por_id(id: int) -> Jogador | None:
    """Responsável por consultar os Jogadores pelo seu id."""
    sql = """
    SELECT
        id,
        nome,
        numero,
        posicao,
        data_nascimento,
        id_clube
    FROM jogadores
    WHERE id = %s;
    """

    with conectar() as conexao, conexao.cursor() as cursor:
        cursor.execute(sql, (id,))
        registro = cursor.fetchone()

    if registro is None:
        return None

    jogador: Jogador = Jogador(
        id=registro[0],
        nome=registro[1],
        numero=registro[2],
        posicao=registro[3],
        data_nascimento=registro[4],
        clube=registro[5],
    )

    return jogador

def apagar(id: int):
    """Responsável por apagar o cadastro do Jogador."""
    sql = "DELETE FROM jogadores WHERE id = %s;"
    with conectar() as conexao, conexao.cursor() as cursor:
        cursor.execute(sql, (id,))
        conexao.commit()
