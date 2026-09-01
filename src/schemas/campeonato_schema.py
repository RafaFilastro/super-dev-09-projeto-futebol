from dataclasses import dataclass


@dataclass
class Campeonato:
    id: int
    nome: str
    temporada: str


@dataclass
class CampeonatoCriar:
    nome: str
    temporada: str


@dataclass
class CampeonatoAtualizar:
    nome: str
    temporada: str
