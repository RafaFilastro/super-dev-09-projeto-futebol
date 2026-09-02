from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from src.controllers import (
    clube_controller,
    estadio_controller,
    jogador_controller,
    tecnico_controller,
)

app: FastAPI = FastAPI()

app.include_router(tecnico_controller.router)
app.include_router(estadio_controller.router)
app.include_router(jogador_controller.router)
app.include_router(clube_controller.router)

RAIZ_PROJETO = Path(__file__).resolve().parent
PASTA_FRONTEND = RAIZ_PROJETO / "frontend"

app.mount(
    "/static",
    StaticFiles(directory=PASTA_FRONTEND),
    name="static",
)


@app.get("/", include_in_schema=False)
def pagina_inicial():
    return FileResponse(PASTA_FRONTEND / "index.html")
