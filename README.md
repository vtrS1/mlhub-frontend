# 🖥️ ML Hub — Frontend

> Dashboard para vendedores gerenciarem seus anúncios no Mercado Livre com análise de concorrentes em tempo real.

---

## ✨ Sobre o projeto

O **ML Hub Frontend** é uma SPA Angular que conecta vendedores à plataforma ML Hub:

- 🔐 Login com OAuth do Mercado Livre (sem senha, sem cadastro)
- 📊 Dashboard com KPIs em tempo real (anúncios ativos, receita, estoque)
- 📦 Criar e editar anúncios com formulário dinâmico por categoria
- ��️ Atributos obrigatórios detectados automaticamente via API do ML
- 🔍 Análise de concorrentes por produto
- 🔄 Sincronização manual e automática com o ML

---

## 🚀 Tecnologias

| Tecnologia | Uso |
|---|---|
| **Angular 19** | Framework SPA (standalone components) |
| **Angular Signals** | Reatividade moderna sem RxJS verboso |
| **Angular Material** | Componentes UI (tabelas, formulários, dialogs) |
| **Tailwind CSS** | Estilização utilitária |
| **TypeScript** | Tipagem estática |

---

## 📁 Estrutura do Projeto

```
src/app/
├── core/
│   ├── guards/        # AuthGuard — protege rotas privadas
│   ├── interceptors/  # AuthInterceptor — injeta JWT em toda requisição
│   ├── models/        # Interfaces TypeScript (Ad, Seller, etc.)
│   └── services/      # AdsService, AuthService
├── layout/
│   └── shell/         # Layout principal (navbar + router-outlet)
└── pages/
    ├── login/          # Tela de login com OAuth
    ├── auth-callback/  # Processa token vindo do backend
    ├── dashboard/      # KPIs e visão geral
    ├── ads-list/       # Listagem de anúncios com filtros
    ├── ad-create/      # Formulário de criação de anúncio
    └── ad-detail/      # Detalhe + análise de concorrentes
```

---

## ⚙️ Configuração

### Pré-requisitos

- Node.js 22+
- Backend ML Hub rodando (local ou Render)

### 1. Clone e instale

```bash
git clone https://github.com/seu-usuario/ml-hub.git
cd ml-hub-front
npm install
```

### 2. Configure o environment

Edite `src/environments/environment.ts` para desenvolvimento local:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

Para produção, `src/environments/environment.prod.ts` já está configurado:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://ml-hub-e53i.onrender.com'
};
```

### 3. Rode em desenvolvimento

```bash
npm start
```

A aplicação estará disponível em `http://localhost:4200`.

---

## 📜 Scripts

| Script | Descrição |
|---|---|
| `npm start` | Servidor de desenvolvimento (`ng serve`) |
| `npm run build` | Build de produção com troca de environments |
| `npm run watch` | Build em modo watch |
| `npm test` | Testes unitários com Karma |

---

## 🔐 Fluxo de Autenticação

```
Usuário clica "Entrar com Mercado Livre"
  → Frontend chama GET /auth/mercadolivre (backend)
  → Backend redireciona para auth.mercadolivre.com.br
  → Usuário autoriza o app no ML
  → ML redireciona para o backend (callback)
  → Backend gera JWT e redireciona para /auth/callback?token=JWT
  → AuthCallbackComponent salva token no localStorage
  → Usuário é redirecionado para o dashboard
```

O `AuthInterceptor` injeta automaticamente o token em todas as requisições ao backend.

---

## �� Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e importe o repositório
2. Configure:
   - **Framework Preset:** Angular
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/ml-hub-front/browser`
3. Deploy automático a cada push na branch `main`

> O arquivo `angular.json` já possui `fileReplacements` configurados para trocar `environment.ts` por `environment.prod.ts` no build de produção.

---

## 📄 Licença

MIT
