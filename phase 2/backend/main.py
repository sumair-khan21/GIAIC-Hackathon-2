"""FastAPI application entry point for the Todo API."""

from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from database import create_tables
from routes.tasks import router as tasks_router

# Create FastAPI application (T029)
app = FastAPI(
    title="Todo API",
    description="REST API for task management with JWT authentication",
    version="1.0.0",
)

# Configure CORS middleware (T030)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include task router (T031)
app.include_router(tasks_router)


# Startup event to create tables (T032)
@app.on_event("startup")
def on_startup():
    """Initialize database tables on application startup."""
    try:
        create_tables()
    except RuntimeError as e:
        print(f"Warning: Could not create tables - {e}")


# Health check endpoint (T033)
@app.get("/health")
def health_check():
    """Health check endpoint to verify API is running."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


# ============================================================================
# Error Handling (Phase 9: T034-T035)
# ============================================================================


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle validation errors with standard error format (T034).

    Returns a 400 response with the error message and code.
    """
    errors = exc.errors()
    if errors:
        # Get the first error message
        error_msg = errors[0].get("msg", "Validation error")
        field = errors[0].get("loc", [])
        if len(field) > 1:
            field_name = field[-1]
            error_msg = f"{field_name}: {error_msg}"
    else:
        error_msg = "Validation error"

    return JSONResponse(
        status_code=400,
        content={
            "error": error_msg,
            "code": "VALIDATION_ERROR"
        }
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """
    Handle unexpected exceptions with generic error message (T035).

    Never expose internal error details to clients.
    """
    # Log the actual error for debugging (in production, use proper logging)
    print(f"Internal error: {exc}")

    return JSONResponse(
        status_code=500,
        content={
            "error": "An unexpected error occurred",
            "code": "SERVER_ERROR"
        }
    )
