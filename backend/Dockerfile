# ===============================
# 1️⃣ Base image Python
# ===============================
FROM python:3.11-slim

# ===============================
# 2️⃣ System dependencies for OpenCV / numpy / face-recognition
# ===============================
RUN apt-get update && apt-get install -y --no-install-recommends \
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
# 3️⃣ Environment defaults
# ===============================
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FASTAPI_ENV=production \
    PORT=8000

# ===============================
# 4️⃣ Workdir
# ===============================
WORKDIR /app

# ===============================
# 5️⃣ Install Python dependencies
# ===============================
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ===============================
# 6️⃣ Copy the FastAPI application
# ===============================
COPY backend/app ./app
COPY backend/storage ./storage

# ===============================
# 7️⃣ Expose FastAPI port
# ===============================
EXPOSE 8000

# ===============================
# 8️⃣ Start FastAPI server
# ===============================
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
