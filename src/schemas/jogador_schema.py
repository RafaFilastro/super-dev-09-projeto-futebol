from dataclasses import dataclass
from datetime import date

from src.schemas.clube_schema import Clube


@dataclass
class Jogador:
    id: int
    nome: str
    clube: Clube
    numero: int | None = None
    posicao: str | None = None
    data_nascimento: date | None = None


@dataclass
class JogadorCadastro:
    nome: str
    id_clube: int
    numero: int | None = None
    posicao: str | None = None
    data_nascimento: date | None = None


@dataclass
class JogadorEditar:
    nome: str
    id_clube: int
    numero: int | None = None
    posicao: str | None = None
    data_nascimento: date | None = None
