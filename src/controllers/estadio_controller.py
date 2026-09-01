from fastapi import APIRouter, HTTPException, status

from src.repositories import estadio_repository
from src.schemas.estadio_schema import EstadioCadastro, EstadioEditar

router: APIRouter = APIRouter(
    prefix="/estadios",
    tags=["Estádios"],
)


@router.post("")
def cadastrar(estadio: EstadioCadastro):
    return estadio_repository.cadastrar(estadio)

@router.get("")
def listar_estadios():
    return estadio_repository.consultar_todos()

@router.put("/{id}")
def editar(id: int, estadio: EstadioEditar):
    estadio_banco = estadio_repository.consultar_por_id(id)

    if estadio_banco is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Estadio não encontrado")

    estadio_repository.editar(id, estadio)
    return {
        "status": "ok"
    }

@router.get("/{id}")
def consultar_por_id(id:int):
    estadio = estadio_repository.consultar_por_id(id)

    if estadio is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Estadio não encontrado")

    return estadio

@router.delete("/{id}")
def apagar(id: int):
    estadio = estadio_repository.consultar_por_id(id)

    if estadio is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Estadio não encontrado")

    estadio_repository.apagar(id)
    return {
        "status": "ok"
    }
