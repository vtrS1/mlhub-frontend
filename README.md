# ML Hub â€” Frontend

> Interface web do desafio tecnico: gerenciamento de anuncios do Mercado Livre.

## Stack

- **Angular 18** (standalone components, signals)
- **Angular Material** - componentes UI
- **TailwindCSS** - utilitarios de layout e espacamento
- **TypeScript** - tipagem estatica

---

## Arquitetura

```
src/app/
â”œâ”€â”€ core/
â”‚   â”œâ”€â”€ guards/       # authGuard (canActivate)
â”‚   â”œâ”€â”€ interceptors/ # authInterceptor (Authorization header)
â”‚   â”œâ”€â”€ models/       # Interfaces TypeScript (Ad, CreateAdDto)
â”‚   â””â”€â”€ services/     # AuthService, AdsService
â”œâ”€â”€ layout/
â”‚   â””â”€â”€ shell/        # Layout principal com sidebar
â””â”€â”€ pages/
    â”œâ”€â”€ login/            # Botao OAuth ML
    â”œâ”€â”€ auth-callback/    # Captura token JWT da URL
    â”œâ”€â”€ dashboard/        # Metricas gerais
    â”œâ”€â”€ ads-list/         # Listagem com filtros e paginacao
    â”œâ”€â”€ ad-create/        # Formulario criacao de anuncio
    â””â”€â”€ ad-detail/        # Edicao de anuncio existente
```

---

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desenvolvimento
ng serve

# Acesse: http://localhost:4200
```

### Scripts

| Script | Descricao |
|--------|-----------|
| `ng serve` | Servidor de desenvolvimento |
| `ng build` | Build de producao em ./dist |
| `ng build --configuration production` | Build otimizado |

---

## Configuracao de ambiente

O arquivo `src/environments/environment.ts` aponta para o backend:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

Para producao, edite `environment.production.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://seu-backend.onrender.com'
};
```

---

## Funcionalidades

| Pagina | Funcionalidades |
|--------|-----------------|
| Login | Autenticacao OAuth com Mercado Livre |
| Dashboard | Resumo de anuncios (total, ativos, pausados) |
| Anuncios | Listagem, busca por titulo, filtro por status, paginacao |
| Novo Anuncio | Formulario com campos obrigatorios do ML (categoria, condicao, imagens) |
| Detalhe | Editar titulo/descricao, atualizar preco/estoque, pausar/reativar |

---

## Fluxo de autenticacao

```
1. Usuario acessa "/" â†’ authGuard redireciona para "/login"
2. Clica "Entrar com Mercado Livre" â†’ GET /auth/mercadolivre
3. ML redireciona para /auth/callback?token=JWT
4. AuthCallbackComponent salva token no localStorage
5. Redireciona para "/dashboard"
6. authInterceptor injeta "Authorization: Bearer <token>" em todas as requests
```

---

## Deploy (Vercel)

1. Fazer push do repositorio para GitHub
2. Criar projeto em [vercel.com](https://vercel.com)
3. Configurar:
   - **Framework Preset:** Angular
   - **Build Command:** `ng build --configuration production`
   - **Output Directory:** `dist/ml-hub-front/browser`
4. Adicionar variavel de ambiente `API_URL` se necessario
5. Atualizar `FRONTEND_URL` no backend com URL do Vercel