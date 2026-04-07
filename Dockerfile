FROM python:3.11-slim

WORKDIR /app

# System deps needed by psycopg binary and sentence-transformers
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first for layer caching.
# torch + sentence-transformers: use CPU-only PyTorch index to avoid
# pulling the ~2 GB CUDA build (this is a CPU-only homelab server).
COPY requirements.txt .
RUN pip install --no-cache-dir \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
