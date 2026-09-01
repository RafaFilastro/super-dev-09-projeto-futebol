from fastapi import APIRouter, HTTPException, status

from src.repositories import tecnico_repository
from src.schemas.tecnico_schema import TecnicoCadastro, TecnicoEditar

router: APIRouter = APIRouter(
    prefix="/tecnicos",
    tags=["Técnicos"],
)


@router.post("")
def cadastrar(tecnico: TecnicoCadastro):
    return tecnico_repository.cadastrar(tecnico)

@router.get("")
def listar_tecnicos():
    return tecnico_repository.consultar_todos()

@router.put("/{id}")
def editar(id: int, tecnico: TecnicoEditar):
    tecnico_banco = tecnico_repository.consultar_por_id(id)

    if tecnico_banco is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tecnico não encontrado.")

    tecnico_repository.editar(id, tecnico)
    return {
        "status": "ok"
    }

@router.get("/{id}")
def consultar_por_id(id: int):
    tecnico = tecnico_repository.consultar_por_id(id)

    if tecnico is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tecnico não encontrado.")

    return tecnico

@router.delete("/{id}")
def apagar(id: int):
    tecnico = tecnico_repository.consultar_por_id(id)

    if tecnico is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tecnico não encontrado.")

    tecnico_repository.apagar(id)
    return {
        "status": "ok"
    }
