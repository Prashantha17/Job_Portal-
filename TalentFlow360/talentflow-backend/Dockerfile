# -------------------------------------------------------------
# TalentFlow 360 - Backend Production Multi-Stage Dockerfile
# Java 21 LTS + Spring Boot 3.4.2
# -------------------------------------------------------------

# Stage 1: Build the application JAR
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /build

# Copy Maven POM and download dependencies for faster layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code
COPY src ./src

# Package production executable JAR without running tests
RUN mvn clean package -DskipTests -B

# -------------------------------------------------------------
# Stage 2: Lightweight, secure JRE runtime
# -------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runner

# Create non-privileged system user for container security
RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

# Copy compiled JAR from builder stage
COPY --from=builder /build/target/talentflow-backend-*.jar app.jar

# Create directory for runtime logs and uploads with appropriate permissions
RUN mkdir -p /app/uploads /app/logs && chown -R spring:spring /app

USER spring:spring

# Expose Spring Boot application port
EXPOSE 8080

# Environment defaults (override via docker-compose / .env)
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Healthcheck targeting Actuator health probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
