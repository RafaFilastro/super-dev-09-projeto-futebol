from fastapi import APIRouter, HTTPException, status

from src.repositories import campeonato_repository
from src.schemas.campeonato_schema import Campeonato, CampeonatoCriar, CampeonatoAtualizar


router = APIRouter()


@router.get("/campeonatos")
def listar_campeonatos():
    return campeonato_repository.listar()


@router.get("/campeonatos/{id}")
def buscar_campeonato_por_id(id: int):
    campeonato = campeonato_repository.buscar_por_id(id)
    if campeonato is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Campeonato não encontrado")

    return campeonato


@router.post("/campeonatos")
def cadastrar_campeonato(campeonato: CampeonatoCriar):
    campeonato_criado = campeonato_repository.cadastrar(campeonato)
    return campeonato_criado


@router.put("/campeonatos/{id}")
def atualizar_campeonato(id: int, campeonato: CampeonatoAtualizar):
    campeonato_existente = campeonato_repository.buscar_por_id(id)
    if campeonato_existente is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Campeonato não encontrado")

    campeonato_repository.atualizar(id, campeonato)
    return {"status": "Campeonato atualizado com sucesso"}


@router.delete("/campeonatos/{id}")
def excluir_campeonato(id: int):
    campeonato_existente = campeonato_repository.buscar_por_id(id)
    if campeonato_existente is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Campeonato não encontrado")

    campeonato_repository.excluir(id)
    return {"status": "Campeonato excluído com sucesso"}
