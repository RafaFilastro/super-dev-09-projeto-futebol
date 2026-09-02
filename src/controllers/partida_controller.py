from fastapi import APIRouter, HTTPException, status

from src.repositories import campeonato_repository, clube_repository, partida_repository

from src.schemas.partida_schema import Partida, PartidaCriar, PartidaAtualizar

router: APIRouter = APIRouter(
    prefix="/partidas",
    tags=["Partidas"],
)


@router.get("")
def listar_partidas():
    return partida_repository.listar()


@router.get("/{id}")
def buscar_partida_por_id(id: int):
    partida = partida_repository.buscar_por_id(id)

    if partida is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partida não encontrada"
        )

    return partida


@router.post("")
def cadastrar_partida(partida: PartidaCriar):
    campeonato = campeonato_repository.buscar_por_id(partida.id_campeonato)

    if campeonato is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campeonato não encontrado",
        )

    mandante = clube_repository.consultar_por_id(partida.id_mandante)

    if mandante is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clube mandante não encontrado",
        )

    visitante = clube_repository.consultar_por_id(partida.id_visitante)

    if visitante is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clube visitante não encontrado",
        )

    if partida.id_mandante == partida.id_visitante:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mandante e visitante devem ser clubes diferentes",
        )

    return partida_repository.cadastrar(partida)


@router.put("/{id}")
def atualizar_partida(id: int, partida: PartidaAtualizar):
    partida_existente = partida_repository.buscar_por_id(id)

    if partida_existente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partida não encontrada",
        )

    campeonato = campeonato_repository.buscar_por_id(partida.id_campeonato)

    if campeonato is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campeonato não encontrado",
        )

    mandante = clube_repository.consultar_por_id(partida.id_mandante)

    if mandante is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clube mandante não encontrado",
        )

    visitante = clube_repository.consultar_por_id(partida.id_visitante)

    if visitante is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clube visitante não encontrado",
        )

    if partida.id_mandante == partida.id_visitante:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mandante e visitante devem ser clubes diferentes",
        )

    partida_repository.atualizar(id, partida)

    return {
        "mensagem": "Partida atualizada com sucesso",
    }


@router.delete("/{id}")
def excluir_partida(id: int):
    partida = partida_repository.buscar_por_id(id)

    if partida is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partida não encontrada",
        )

    partida_repository.excluir(id)

    return {
        "mensagem": "Partida excluída com sucesso",
    }