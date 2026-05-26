# syntax=docker/dockerfile:1

################################################################################
# Build stage — compile the Spring Boot fat jar with Gradle.
FROM eclipse-temurin:21-jdk-jammy AS build

WORKDIR /workspace

# Copy the Gradle wrapper and build scripts first so dependency resolution can
# be cached when only source files change.
COPY --chmod=0755 gradlew gradlew
COPY gradle/ gradle/
COPY settings.gradle gradle.properties ./
COPY app/build.gradle app/build.gradle

# Prime the dependency cache.
RUN --mount=type=cache,target=/root/.gradle \
    ./gradlew :app:dependencies --no-daemon || true

# Copy sources and build the boot jar.
COPY app/src app/src
RUN --mount=type=cache,target=/root/.gradle \
    ./gradlew :app:bootJar --no-daemon -x test \
    && cp build/app/libs/*.jar /workspace/app.jar

################################################################################
# Runtime stage — minimal JRE image.
FROM eclipse-temurin:21-jre-jammy AS final

ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser
USER appuser

WORKDIR /app
COPY --from=build /workspace/app.jar app.jar

# Render injects $PORT; default to 8080 for local runs.
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "echo \"[boot] DB_URL set: $([ -n \\\"$DB_URL\\\" ] && echo YES || echo NO) | DB_USERNAME set: $([ -n \\\"$DB_USERNAME\\\" ] && echo YES || echo NO) | JWT_SECRET set: $([ -n \\\"$JWT_SECRET\\\" ] && echo YES || echo NO) | PORT=$PORT\"; java -Dserver.port=${PORT} -jar /app/app.jar"]
