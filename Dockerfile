# Império Urbano: site, API e WebSocket num único servidor (docs/15-publicacao-navegador.md).
# Build: docker build -t imperio-urbano .

# 1) Site (Vite): gera apps/web/dist.
FROM node:22-alpine AS web
WORKDIR /src
COPY package.json package-lock.json tsconfig.base.json tsconfig.json ./
COPY apps/web/package.json apps/web/
COPY packages/game-data/package.json packages/game-data/
COPY packages/shared-types/package.json packages/shared-types/
RUN npm ci --no-audit --no-fund
COPY packages packages
COPY apps/web apps/web
COPY assets/board assets/board
COPY docs/referencias docs/referencias
RUN npm run build -w @imperio/web

# 2) API (Spring Boot) com o site dentro de classpath:/static.
FROM eclipse-temurin:21-jdk AS api
WORKDIR /src
COPY apps/api/mvnw apps/api/pom.xml apps/api/
COPY apps/api/.mvn apps/api/.mvn
RUN cd apps/api && chmod +x mvnw && ./mvnw -q -B dependency:go-offline
COPY packages/game-data/data packages/game-data/data
COPY apps/api/src apps/api/src
COPY --from=web /src/apps/web/dist apps/api/src/main/resources/static
RUN cd apps/api && ./mvnw -q -B package -DskipTests && cp target/api-*.jar /src/app.jar

# 3) Execução: só o Java e o jar, sem ferramentas de build, com usuário sem privilégios.
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S imperio && adduser -S imperio -G imperio
COPY --from=api /src/app.jar app.jar
USER imperio
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
