# Build stage
FROM maven:3.9.6-amazoncorretto-21-al2023 AS builder
LABEL authors="mehdi,mohammed" \
      org.opencontainers.image.authors="sfm.div@gmail.com"

ARG SPRING_ACTIVE_PROFILE

WORKDIR /build
COPY pom.xml .
COPY src ./src/

# Download dependencies and build in separate layers
RUN mvn dependency:go-offline && \
    mvn clean package -Dmaven.test.skip=true -T 4

# Runtime stage
FROM amazoncorretto:21-alpine
WORKDIR /app

# Add non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy jar from builder stage
COPY --from=builder --chown=spring:spring /build/target/garage-management-*.jar app.jar

# Configure health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:8090/actuator/health || exit 1

# Set environment variables
ENV JAVA_OPTS="-Xms512m -Xmx1024m"

# Run the application with preview features enabled
ENTRYPOINT ["java", "--enable-preview", "-Xms512m", "-Xmx1024m", "-jar", "app.jar"]
