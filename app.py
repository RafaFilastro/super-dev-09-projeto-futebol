from fastapi import FastAPI

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
