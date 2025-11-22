# ===============================
# 1️⃣ Base image Python
# ===============================
FROM python:3.11-slim

# ===============================
# 2️⃣ Install system dependencies (FIXED)
# ===============================
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libgl1 \
    libglib2.0-0 \
    libopencv-dev \
    libopenblas-dev \
    liblapack-dev \
    gfortran \
    && rm -rf /var/lib/apt/lists/*


# ===============================
# 3️⃣ Workdir
# ===============================
WORKDIR /app

# ===============================
# 4️⃣ Copy requirements
# ===============================
COPY backend/requirements.txt /app/requirements.txt

# ===============================
# 5️⃣ Install Python dependencies
# ===============================
RUN pip install --no-cache-dir -r /app/requirements.txt

# ===============================
# 6️⃣ Copy the FastAPI application
# ===============================
COPY backend/app /app/app

# ===============================
# 7️⃣ Environment variables
# ===============================
ENV PYTHONUNBUFFERED=1
ENV FASTAPI_ENV=production
ENV PORT=8000

# ===============================
# 8️⃣ Expose FastAPI port
# ===============================
EXPOSE 8000

# ===============================
# 9️⃣ Start FastAPI server
# ===============================
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
