# Use JDK 21 to match your code
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY target/*.jar gateway-service.jar
EXPOSE 9090
ENTRYPOINT ["java", "-jar", "gateway-service.jar"]