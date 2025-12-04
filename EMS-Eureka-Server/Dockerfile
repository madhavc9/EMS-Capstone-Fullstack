# ---------- Build Stage ----------
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app
COPY . .

RUN ./mvnw clean package -DskipTests

# ---------- Run Stage ----------
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the built jar (any .jar inside target/)
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8761

ENTRYPOINT ["java", "-jar", "app.jar"]