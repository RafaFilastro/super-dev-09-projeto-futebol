from dataclasses import dataclass
from datetime import date


@dataclass
class Tecnico:
    id: int
    nome: str
    nacionalidade: str | None
    data_nascimento: date | None


@dataclass
class TecnicoCadastro:
    nome: str
    nacionalidade: str | None = None
    data_nascimento: date | None = None

@dataclass
class TecnicoEditar:
    nome: str
    nacionalidade: str | None
    data_nascimento: date | None
