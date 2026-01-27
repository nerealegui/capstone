from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI(title="DevHub")

# Get the absolute path to the static directory
static_dir = Path(__file__).parent / "static"

# Mount static files
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.get("/")
async def index():
    """Serve the index page"""
    return FileResponse(static_dir / "index.html")


@app.get("/platform")
async def platform():
    """Serve the platform page"""
    return FileResponse(static_dir / "platform.html")


@app.get("/integrations")
async def integrations():
    """Serve the integrations page"""
    return FileResponse(static_dir / "integrations.html")


@app.get("/productivity")
async def productivity():
    """Serve the productivity page"""
    return FileResponse(static_dir / "productivity.html")


@app.get("/security")
async def security():
    """Serve the security page"""
    return FileResponse(static_dir / "security.html")


@app.get("/agent")
async def agent():
    """Serve the agent page"""
    return FileResponse(static_dir / "agent.html")


@app.get("/script")
async def script():
    """Serve the script page"""
    return FileResponse(static_dir / "script.html")


@app.get("/healthz")
async def healthz():
    """Health check endpoint"""
    return {"ok": True}
