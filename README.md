# Docker Task Manager

Simple Node.js + Express + MongoDB app for learning Docker and Docker Compose.

## Run with Docker Compose
    docker compose up -d --build
Open http://localhost:3000

## Stop
    docker compose down        # data safe (volume rehta hai)
    docker compose down -v     # data bhi delete

## Run manually (without Compose)
    docker network create my-network
    docker run -d --name mongo --network my-network -v mongo-data:/data/db mongo:7
    docker build -t task-app:1.0 .
    docker run -d --name task-app --network my-network -p 3000:3000 \
      -e MONGO_URL=mongodb://mongo:27017/taskdb task-app:1.0
