from fastapi import APIRouter, HTTPException, status

from src.repositories import (
    clube_repository,
    estadio_repository,
    tecnico_repository,
)
from src.schemas.clube_schema import ClubeCadastro, ClubeEditar


router: APIRouter = APIRouter(
    prefix="/clubes",
    tags=["Clubes"],
)


@router.get("")
def listar_clubes():
    return clube_repository.consultar_todos()


@router.post("")
def cadastrar(clube: ClubeCadastro):
    tecnico = tecnico_repository.consultar_por_id(clube.id_tecnico)

    if tecnico is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tecnico não encontrado",
        )

    estadio = estadio_repository.consultar_por_id(clube.id_estadio)

    if estadio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estadio não encontrado",
        )

    return clube_repository.cadastrar(clube)


@router.put("/{id}")
def editar(id: int, clube: ClubeEditar):
    clube_banco = clube_repository.consultar_por_id(id)

    if clube_banco is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clube não encontrado",
        )

    tecnico = tecnico_repository.consultar_por_id(clube.id_tecnico)

    if tecnico is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tecnico não encontrado",
        )

    estadio = estadio_repository.consultar_por_id(clube.id_estadio)

    if estadio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estadio não encontrado",
        )

    clube_repository.editar(id, clube)

    return {
        "mensagem": "Clube editado com sucesso",
    }


@router.get("/{id}")
def consultar_por_id(id: int):
    clube = clube_repository.consultar_por_id(id)

    if clube is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clube não encontrado",
        )

    return clube


@router.delete("/{id}")
def apagar(id: int):
    clube = clube_repository.consultar_por_id(id)

    if clube is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clube não encontrado",
        )

    clube_repository.apagar(id)

    return {
        "mensagem": "Clube apagado com sucesso",
    }
