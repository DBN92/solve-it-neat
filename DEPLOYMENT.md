# Deployment Guide

## Problemas Resolvidos

### 1. Erro de Cache do NPM (EBUSY)
**Problema**: `npm error EBUSY: resource busy or locked, rmdir '/app/node_modules/.cache'`

**Solução**: 
- Configuração otimizada do `nixpacks.toml` com fases separadas
- Uso de flags `--prefer-offline --no-audit --no-fund` para evitar conflitos de cache
- Criação de `.dockerignore` para excluir arquivos desnecessários

### 2. Variável Indefinida no Nixpacks
**Problema**: `Usage of undefined variable '$NIXPACKS_PATH'`

**Solução**:
- Configuração explícita de variáveis de ambiente no `nixpacks.toml`
- Definição clara das fases de setup, install e build
- Especificação da versão do Node.js (20)

## Arquivos Modificados/Criados

### `nixpacks.toml`
```toml
[variables]
NODE_ENV = "production"

[phases.setup]
nixPkgs = ["nodejs_20", "npm"]

[phases.install]
cmds = ["npm ci --prefer-offline --no-audit --no-fund"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm run preview"
```

### `.dockerignore`
Arquivo criado para otimizar builds Docker, excluindo:
- `node_modules`
- Arquivos de cache
- Arquivos de desenvolvimento
- Logs e arquivos temporários

### `Dockerfile`
Dockerfile multi-stage otimizado:
- Usa Node.js 20 Alpine para imagens menores
- Separação de dependências e build
- Usuário não-root para segurança
- Configuração otimizada para produção

### `package.json`
Script de preview atualizado:
```json
"preview": "vite preview --host 0.0.0.0 --port 4173"
```

## Como Fazer Deploy

### Opção 1: Usando Nixpacks (Recomendado)
```bash
# O nixpacks.toml já está configurado
# Apenas faça push para seu provedor de deploy
```

### Opção 2: Usando Docker
```bash
# Build da imagem
docker build -t solve-it-neat .

# Executar container
docker run -p 4173:4173 solve-it-neat
```

### Opção 3: Build Local
```bash
# Instalar dependências
npm ci

# Build para produção
npm run build

# Servir arquivos estáticos
npm run preview
```

## Verificação de Funcionamento

1. **Build Local**: ✅ Funcionando
2. **Preview Server**: ✅ Funcionando na porta 4173
3. **Configuração Docker**: ✅ Otimizada
4. **Nixpacks Config**: ✅ Corrigida

## Portas Utilizadas

- **Desenvolvimento**: 8080 (`npm run dev`)
- **Preview/Produção**: 4173 (`npm run preview`)

## Notas Importantes

- A aplicação usa Vite como bundler
- Todas as dependências são instaladas com flags otimizadas
- O build gera arquivos estáticos na pasta `dist/`
- A configuração é compatível com provedores como Vercel, Netlify, Railway, etc.