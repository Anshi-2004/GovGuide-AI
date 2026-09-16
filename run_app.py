"""
GovGuide AI — Master Application Runner
Launches FastAPI Backend (port 8000) and React Vite Frontend (port 5173).
"""

import os
import sys
import subprocess
import time

# Ensure UTF-8 output on Windows consoles
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))


def start_backend():
    """Start FastAPI Uvicorn Server."""
    print("[*] Launching FastAPI REST API Backend on http://localhost:8000...")
    backend_cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "backend.app.main:app",
        "--host",
        "0.0.0.0",
        "--port",
        "8000",
        "--reload",
    ]
    return subprocess.Popen(backend_cmd, cwd=PROJECT_ROOT)


def start_frontend():
    """Start Vite React Frontend Dev Server."""
    print("[*] Launching React Frontend on http://localhost:5173...")
    frontend_dir = os.path.join(PROJECT_ROOT, "frontend")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    return subprocess.Popen([npm_cmd, "run", "dev"], cwd=frontend_dir)


def main():
    print("=" * 65)
    print("  GovGuide AI -- Decoupled Stack Launcher")
    print("=" * 65)

    # 1. Start Backend
    backend_proc = start_backend()
    time.sleep(2)

    # 2. Start Frontend
    frontend_proc = start_frontend()
    time.sleep(3)

    print("\n[SUCCESS] GovGuide AI is up and running!")
    print("  - Frontend UI:     http://localhost:5173")
    print("  - FastAPI Swagger: http://localhost:8000/docs")
    print("  - Health Endpoint: http://localhost:8000/api/health")
    print("\nPress Ctrl+C to stop all servers.\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[*] Shutting down GovGuide AI services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("[OK] Stopped successfully.")


if __name__ == "__main__":
    main()
