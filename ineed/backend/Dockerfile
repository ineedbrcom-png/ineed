# Estágio 1: Build
# Usa uma imagem Node.js para instalar dependências e compilar o TypeScript.
FROM node:18-slim AS builder

# Define o diretório de trabalho na imagem
WORKDIR /app

# Copia os arquivos de definição de pacotes
COPY package*.json ./

# Instala todas as dependências, incluindo as de desenvolvimento (como typescript)
RUN npm install

# Copia o restante do código-fonte da aplicação
COPY . .

# Compila o código TypeScript para JavaScript (o resultado vai para a pasta 'dist' por padrão)
RUN npm run build

# Estágio 2: Produção
# Usa uma imagem limpa e leve para a execução
FROM node:18-slim
WORKDIR /app
COPY package*.json ./
# Instala apenas as dependências de produção
RUN npm install --omit=dev
# Copia os arquivos compilados do estágio de build
COPY --from=builder /app/dist ./dist
# Expõe a porta que a aplicação vai usar
EXPOSE 8080
# Comando para iniciar a aplicação
CMD [ "node", "dist/index.js" ]