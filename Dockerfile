# Step 1: Build the application using Maven
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app
# Copy the pom.xml and source code into the container
COPY pom.xml .
COPY src ./src
# Build the "fat" JAR file and skip tests for a faster Render build
RUN mvn clean package -DskipTests

# Step 2: Run the application
FROM openjdk:17-jdk-slim
WORKDIR /app
# Copy the compiled JAR from the build stage to the run stage
# Note: 'pos-system-1.0-SNAPSHOT.jar' must match the artifactId and version in your pom.xml
COPY --from=build /app/target/pos-system-1.0-SNAPSHOT.jar app.jar

# Expose the port (Render defaults to 8080 or 10000)
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]