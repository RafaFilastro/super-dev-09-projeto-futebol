from fastapi import APIRouter, HTTPException, status

from src.repositories import gol_repository, jogador_repository, partida_repository
from src.schemas.gol_schema import GolAtualizar, GolCriar


router: APIRouter = APIRouter(
    prefix="/gols",
    tags=["Gols"],
)


def _validar_partida_e_jogador(id_partida: int, id_jogador: int):
    partida = partida_repository.buscar_por_id(id_partida)

    if partida is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partida não encontrada",
        )

    jogador = jogador_repository.consultar_por_id(id_jogador)

    if jogador is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jogador não encontrado",
        )

    if not partida_repository.jogador_participa_da_partida(
        id_partida,
        id_jogador,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O jogador não pertence a nenhum clube desta partida",
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
    _validar_partida_e_jogador(gol.id_partida, gol.id_jogador)
    return gol_repository.cadastrar(gol)


@router.put("/{id}")
def atualizar_gol(id: int, gol: GolAtualizar):
    gol_existente = gol_repository.buscar_por_id(id)

    if gol_existente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gol não encontrado",
        )

    _validar_partida_e_jogador(gol.id_partida, gol.id_jogador)
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
