"""ASGI entrypoint compatibility module for uvicorn main:app."""

from uvicorn.middleware.wsgi import WSGIMiddleware

from api.app import app as flask_app

# Expose an ASGI app so uvicorn can serve the existing Flask service.
app = WSGIMiddleware(flask_app)
