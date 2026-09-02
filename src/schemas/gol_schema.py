from pydantic import BaseModel


class Gol(BaseModel):
    id: int
    minuto: int
    id_partida: int
    id_jogador: int


class GolCriar(BaseModel):
    minuto: int
    id_partida: int
    id_jogador: int


class GolAtualizar(BaseModel):
    minuto: int
    id_partida: int
    id_jogador: int