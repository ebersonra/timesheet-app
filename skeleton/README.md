# Skeleton App

Estrutura base minimalista para novos projetos Node.js com Express.

## Camadas Exemplificadas
- **Model**: lógica de dados.
- **Service**: regras de negócio.
- **Controller**: orquestra requisições e respostas.
- **Route**: define rotas da API.
- **View**: arquivos estáticos em `public/`.

## Uso
1. Instale dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor:
   ```bash
   npm start
   ```

## Automação com GitHub Actions
O workflow em `.github/workflows/ci.yml` realiza build, cria uma release/tag e faz deploy para a Netlify em cada push para a branch `main`. Para funcionar é necessário definir os segredos `NETLIFY_AUTH_TOKEN` e `NETLIFY_SITE_ID` no repositório.

## Deploy na Netlify
O arquivo `netlify.toml` contém a configuração mínima para publicar os arquivos de `public/`. Durante o desenvolvimento local use:
```bash
netlify dev
```
