from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="DevHub", description="Enterprise Development Platform")

# Get the directory where main.py is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")

# Mount static files
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
async def home():
    """Home page"""
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/platform")
async def platform():
    """Platform overview page"""
    return FileResponse(os.path.join(STATIC_DIR, "platform.html"))

@app.get("/integrations")
async def integrations():
    """Integrations page"""
    return FileResponse(os.path.join(STATIC_DIR, "integrations.html"))

@app.get("/productivity")
async def productivity():
    """Productivity tools page"""
    return FileResponse(os.path.join(STATIC_DIR, "productivity.html"))

@app.get("/security")
async def security():
    """Security features page"""
    return FileResponse(os.path.join(STATIC_DIR, "security.html"))

@app.get("/agent")
async def agent():
    """AI Agent page"""
    return FileResponse(os.path.join(STATIC_DIR, "agent.html"))

@app.get("/script")
async def script():
    """Script automation page"""
    return FileResponse(os.path.join(STATIC_DIR, "script.html"))

@app.get("/healthz")
async def healthz():
    """Health check endpoint"""
    return {"status": "ok", "message": "DevHub is running"}
