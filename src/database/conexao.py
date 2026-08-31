from mysql.connector import connect
from mysql.connector.abstracts import MySQLConnectionAbstract

from src.settings.settings import configuracoes


def conectar() -> MySQLConnectionAbstract:
    """Abre uma conexão nova. Quem chama é responsável por fechar (use `with`)."""
    return connect(
        host=configuracoes.db_host,
        port=configuracoes.db_port,
        user=configuracoes.db_user,
        password=configuracoes.db_password,
        database=configuracoes.db_name,
    )
