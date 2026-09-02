from fastapi import APIRouter, HTTPException, status

from src.repositories import gol_repository,jogador_repository, partida_repository
from src.schemas.gol_schema import GolCriar, GolAtualizar


router: APIRouter = APIRouter(
    prefix="/gols",
    tags=["Gols"],
)


@router.get("")
def listar_gols():
    return gol_repository.listar()


@router.get("/{id}")
def buscar_gol_por_id(id: int):
    gol = gol_repository.buscar_por_id(id)

    if gol is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gol não encontrado",
        )

    return gol


@router.post("")
def cadastrar_gol(gol: GolCriar):
    partida = partida_repository.buscar_por_id(gol.id_partida)

    if partida is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partida não encontrada",
        )

    jogador = jogador_repository.consultar_por_id(gol.id_jogador)

    if jogador is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jogador não encontrado",
        )

    return gol_repository.cadastrar(gol)


@router.put("/{id}")
def atualizar_gol(id: int, gol: GolAtualizar):
    gol_existente = gol_repository.buscar_por_id(id)

    if gol_existente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gol não encontrado",
        )

    partida = partida_repository.buscar_por_id(gol.id_partida)

    if partida is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partida não encontrada",
        )

    jogador = jogador_repository.consultar_por_id(gol.id_jogador)

    if jogador is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jogador não encontrado",
        )

    gol_repository.atualizar(id, gol)

    return {
        "mensagem": "Gol atualizado com sucesso",
    }


@router.delete("/{id}")
def excluir_gol(id: int):
    gol = gol_repository.buscar_por_id(id)

    if gol is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gol não encontrado",
        )

    gol_repository.excluir(id)

    return {
        "mensagem": "Gol excluído com sucesso",
    }