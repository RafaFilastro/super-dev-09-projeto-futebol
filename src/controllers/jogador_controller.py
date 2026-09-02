from fastapi import APIRouter, HTTPException, status

from src.repositories import clube_repository, jogador_repository
from src.schemas.jogador_schema import JogadorCadastro, JogadorEditar

router: APIRouter = APIRouter(
    prefix="/jogadores",
    tags=["Jogadores"],
)


@router.post("")
def cadastrar(jogador: JogadorCadastro):
    clube = clube_repository.consultar_por_id(jogador.id_clube)

    if clube is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Clube não encontrado",
        )

    return jogador_repository.cadastrar(jogador)

@router.get("")
def listar_jogadores():
    return jogador_repository.consultar_todos()

@router.put("/{id}")
def editar(id: int, jogador: JogadorEditar):
    jogador_banco = jogador_repository.consultar_por_id(id)

    if jogador_banco is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Jogador não encontrado.")

    jogador_repository.editar(id, jogador)
    return {
        "status": "ok"
    }

@router.get("/{id}")
def consultar_por_id(id: int):
    jogador = jogador_repository.consultar_por_id(id)

    if jogador is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Jogador não encontrado.")

    return jogador

@router.delete("/{id}")
def apagar(id: int):
    jogador = jogador_repository.consultar_por_id(id)

    if jogador is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Jogador não encontrado.")

    jogador_repository.apagar(id)
    return {
        "status": "ok"
    }
