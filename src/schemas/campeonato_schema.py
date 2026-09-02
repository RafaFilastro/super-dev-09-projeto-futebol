from pydantic import BaseModel


class Campeonato(BaseModel):
    id: int
    nome: str
    temporada: int


class CampeonatoCriar(BaseModel):
    nome: str
    temporada: int


class CampeonatoAtualizar(BaseModel):
    nome: str
    temporada: int
