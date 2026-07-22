import os

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from routes import router
from storage import UPLOAD_DIR

app = FastAPI()

os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(router)

@app.get("/")
async def root():
    return {"message" : "Welcome to your Grove"}