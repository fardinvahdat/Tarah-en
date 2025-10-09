# Updated /backend/Dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y libgl1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create appuser
RUN addgroup --gid 1000 appuser && \
    adduser --system --uid 1000 --gid 1000 --no-create-home appuser

# Set working directory
WORKDIR /app

# Copy requirements first for caching
COPY requirements.txt .

# Install dependencies with cache fix
RUN pip install --no-cache-dir -r requirements.txt gunicorn && \
    mkdir -p /numba_cache && chown appuser:appuser /numba_cache

# Copy ALL application files
COPY . .

# Create static directory and set permissions
RUN mkdir -p /app/static/uploads && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Set Numba cache directory
ENV NUMBA_CACHE_DIR=/numba_cache

EXPOSE 8009

# Use Uvicorn directly instead of Gunicorn
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8009", \
     "--timeout-keep-alive", "300", "--limit-max-requests", "1000", \
     "--limit-concurrency", "100", "--ws-max-size", "100000000"]