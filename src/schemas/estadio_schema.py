from dataclasses import dataclass


@dataclass
class Estadio:
    id: int
    nome: str
    cidade: str
    estado: str
    capacidade: int | None = None

@dataclass
class EstadioCadastro:
    nome: str
    cidade: str
    estado: str
    capacidade: int | None = None

@dataclass
class EstadioEditar:
    nome: str
    cidade: str
    estado: str
    capacidade: int | None
