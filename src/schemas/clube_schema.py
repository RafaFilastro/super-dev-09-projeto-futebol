from dataclasses import dataclass

from src.schemas.estadio_schema import Estadio
from src.schemas.tecnico_schema import Tecnico


@dataclass
class Clube:
    id: int
    nome: str
    cidade: str
    estado: str
    tecnico: Tecnico
    estadio: Estadio
    ano_fundacao: int | None = None


@dataclass
class ClubeCadastro:
    nome: str
    cidade: str
    estado: str
    id_tecnico: int
    id_estadio: int
    ano_fundacao: int | None = None


@dataclass
class ClubeEditar:
    nome: str
    cidade: str
    estado: str
    id_tecnico: int
    id_estadio: int
    ano_fundacao: int | None = None
