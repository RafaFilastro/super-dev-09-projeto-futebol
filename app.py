from fastapi import FastAPI

from src.controllers import tecnico_controller

app: FastAPI = FastAPI()

app.include_router(tecnico_controller.router)
