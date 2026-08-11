import logging
import sys
from .config import settings

def setup_logging():
    level = getattr(logging, settings.log_level.upper(), logging.INFO)
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
    )
    handler.setFormatter(formatter)
    root = logging.getLogger()
    root.setLevel(level)
    root.handlers.clear()
    root.addHandler(handler)
    # quiet noisy libs
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    return root

logger = logging.getLogger("rag")
