# STEP 1: Build the application
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app

# Copy files and build the JAR
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# STEP 2: Run the application
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

# The filename MUST match the <artifactId>-<version> from your pom.xml
COPY --from=build /app/target/pos-system-1.0-SNAPSHOT.jar app.jar

# Port 8080 is the default we are using for Render
EXPOSE 8080

# Run the "Fat JAR"
ENTRYPOINT ["java", "-jar", "app.jar"]