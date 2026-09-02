from datetime import datetime

from pydantic import BaseModel

class Partida(BaseModel):
    id : int
    data_partida : datetime
    id_campeonato : int
    id_mandante: int
    id_visitante: int
    gols_mandante: int = 0
    gols_visitante: int = 0


class PartidaCriar(BaseModel):
    data_partida: datetime
    id_campeonato: int
    id_mandante: int
    id_visitante: int
    gols_mandante: int = 0
    gols_visitante: int = 0


class PartidaAtualizar(BaseModel):
    data_partida: datetime
    id_campeonato: int
    id_mandante: int
    id_visitante: int
    gols_mandante: int = 0
    gols_visitante: int = 0
