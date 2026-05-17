# OpenPal Rider Backend

Backend service for OpenPal — an app that helps university students find and share rides with other students on campus.

## Tech Stack

- Java + Spring Boot
- Gradle
- Docker

## Getting Started

Run locally:

```bash
./gradlew bootRun
```

Run with Docker:

```bash
docker compose up --build
```

## Project Structure

```
app/src/main/java/openpal
├── configuration   # App configuration
├── controllers     # REST endpoints
├── database        # Entities & repositories
└── services        # Business logic
```

## Build

```bash
./gradlew build
```
