# Step 1: Use a lightweight Java 21 runtime as the base image
FROM eclipse-temurin:21-jdk-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy the built WAR or JAR file from your target folder
# Note: Use *.war if your pom.xml <packaging> is war, otherwise use *.jar
COPY target/*.war app.war

# Step 4: Run the application
ENTRYPOINT ["java", "-jar", "app.war"]