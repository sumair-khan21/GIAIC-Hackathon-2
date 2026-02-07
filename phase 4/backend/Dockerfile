# Stage 1: Install dependencies
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Production runner
FROM python:3.11-slim
WORKDIR /app

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --gid 1001 appuser

COPY --from=builder /root/.local/lib /home/appuser/.local/lib
COPY . .
RUN chown -R appuser:appgroup /app

USER appuser
ENV PYTHONPATH=/home/appuser/.local/lib/python3.11/site-packages
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
