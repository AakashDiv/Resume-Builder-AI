FROM node:20-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive \
    NODE_ENV=production \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    CHROME_BIN=/usr/bin/chromium \
    CHROMEDRIVER_PATH=/usr/bin/chromedriver \
    PYTHON_BIN=python3

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    chromium \
    chromium-driver \
    fonts-liberation \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:${PATH}"

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY scraper/requirements.txt ./scraper/requirements.txt
RUN pip install --upgrade pip && pip install -r ./scraper/requirements.txt

COPY backend ./backend
COPY scraper ./scraper

RUN mkdir -p /app/backend/tmp

EXPOSE 5000

CMD ["node", "backend/server.js"]
