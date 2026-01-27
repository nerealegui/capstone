from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# Mount static files
static_path = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=static_path), name="static")


@app.get("/")
async def index():
    """Serve the home page"""
    return FileResponse(os.path.join(static_path, "index.html"))


@app.get("/platform")
async def platform():
    """Serve the platform page"""
    return FileResponse(os.path.join(static_path, "platform.html"))


@app.get("/integrations")
async def integrations():
    """Serve the integrations page"""
    return FileResponse(os.path.join(static_path, "integrations.html"))


@app.get("/productivity")
async def productivity():
    """Serve the productivity page"""
    return FileResponse(os.path.join(static_path, "productivity.html"))


@app.get("/security")
async def security():
    """Serve the security page"""
    return FileResponse(os.path.join(static_path, "security.html"))


@app.get("/agent")
async def agent():
    """Serve the agent page"""
    return FileResponse(os.path.join(static_path, "agent.html"))


@app.get("/script")
async def script():
    """Serve the script page"""
    return FileResponse(os.path.join(static_path, "script.html"))


@app.get("/healthz")
async def healthz():
    """Health check endpoint"""
    return {"ok": True}
