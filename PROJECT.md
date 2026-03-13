# PROJECT.md — Documentação Viva do Somnitide

> Atualizado após: **CI/CD ETAPA FINAL — Visualização de Testes no GitHub**

---

## O que é este projeto

Web-app de controle de ciclo do sono. O usuário clica "Vou dormir agora" e recebe sugestões de horários para acordar descansado, evitando interromper ciclos de sono profundo. Monorepo monolítico: Angular (frontend) + Spring Boot (backend) + PostgreSQL via Supabase.

---

## Decisões Técnicas

### Migration: Flyway ✅ (vs Liquibase ❌)
**Escolhido:** Flyway  
**Motivo:** sintaxe SQL pura, integração nativa com Spring Boot auto-config, menor boilerplate para projetos novos. Liquibase requer XML/YAML de change sets, overhead desnecessário para MVP.  
**Consequence:** migrations em `backend/src/main/resources/db/migration/V{n}__{descricao}.sql`.

### UI: Angular Material ✅ (vs Tailwind ❌)
**Escolhido:** Angular Material  
**Motivo:** componentes prontos (cards, botões, forms) já integrados ao ecossistema Angular com a11y e dark mode built-in. Tailwind exige mais CSS custom para atingir o mesmo resultado.  
**Status:** será configurado na ETAPA 4.

### Domínio puro Java (sem Spring)
Todo código em `dev.somnitide.domain` não tem import de `org.springframework`. Isso garante testabilidade com JUnit puro, sem Spring context booting.

### Java 21 + Records
`UserPreferences` e `WakeSuggestion` são `record` (imutáveis). `SleepSession` é classe mutável (estado evolui com `end()`).

### Padrão de Pacotes
```
dev.somnitide/
├── domain/
│   ├── model/          # entidades e value objects (puro Java)
│   ├── service/        # serviços de domínio (puro Java)
│   └── exception/      # exceções de domínio
├── application/
│   ├── port/           # interfaces de repositório (ports)
│   └── usecase/        # casos de uso (orquestração)
└── infrastructure/
    ├── persistence/
    │   ├── entity/     # JPA entities (mapeamento infra)
    │   ├── jpa/        # Spring Data JPA repositories
    │   └── adapter/    # adapters: porta domínio → JPA
    └── web/            # controllers REST (ETAPA 3)
```

### Recommended Cycle Logic
- Se ciclo 5 está na faixa `[minCycles..maxCycles]` → recomendado = 5
- Senão → recomendado = ciclo no índice **meio** da lista (`size / 2`)
  - Exemplo: faixa 1..3 (size=3) → índice 1 → ciclo 2 é recomendado

---

## Etapa 1 — O que foi feito

### Resumo
- Criada estrutura Maven monorepo (root `pom.xml` + módulo `backend/pom.xml`)
- Implementado **domínio puro** (zero Spring):
  - `UserPreferences` (record com factory `defaults()`)
  - `WakeSuggestion` (record imutável)
  - `SleepSession` (entidade com `end()`)
  - `DomainException` (RuntimeException com `errorCode`)
  - `SleepCycleCalculator` (serviço: `validatePreferences` + `calculateWakeSuggestions`)
- **8 testes unitários** escritos com TDD (Red → Green):
  - Happy path com defaults (horários confirmados matematicamente)
  - Edge case: minCycles == maxCycles → 1 sugestão
  - Edge case: ciclo 5 fora da faixa → recomendado é o do meio
  - 4 erros de preferências inválidas
- 5 use-case stubs criados (ETAPA 3)
- `SomnitideApplication.java` (main Spring Boot)
- `application.properties` com auto-configs desabilitadas (sem DB/Security até ETAPA 2/3)
- `.gitignore` cobrindo `.env`, `target/`, IDE files
- `.env.exemple` sanitizado (sem credenciais reais)
- `.env` criado (gitignored) com credenciais Supabase reais

---

## Etapa 2 — O que foi feito

### Resumo
- Arquitetura Port/Adapter: JPA entities em `infrastructure/persistence/entity/`, interfaces de repositório em `application/port/`
- Flyway migrations: `V1__create_user_preferences.sql` e `V2__create_sleep_sessions.sql`
- `UserPreferencesEntity`, `SleepSessionEntity` com `fromDomain()` / `toDomain()`
- Spring Data JPA: `UserPreferencesJpaRepository`, `SleepSessionJpaRepository` (com derived queries)
- Adapters: `UserPreferencesRepositoryImpl`, `SleepSessionRepositoryImpl`
- `application.properties` com datasource via env vars, Flyway habilitado, Security ainda excluída
- [x] Cadastro/Login com email/senha (Supabase Auth)
- [x] Persistência de sessão e Guard de rotas
- [x] Layout Base (Public vs Private)
- [x] Correção de Erros de Auth (JWKS/ES256)
- [x] Refinamento Visual (Header duplicado/Sobreposição)
- [x] Avaliação de Qualidade do Sono (Questionário 5-perguntas)
- [ ] Testes de integração (Etapa 3 - em andamento)
- Testcontainers no `pom.xml` + Surefire configurado para `*IT` classes
- **7 testes de integração** (Testcontainers PostgreSQL) — pulados com `disabledWithoutDocker=true` quando Docker ausente
- **Tests run: 15, Failures: 0, Errors: 0, Skipped: 7** → **BUILD SUCCESS** ✅

---

## Etapa 3 — O que foi feito

### Resumo
- **Application Use Cases**: `StartSleepSession`, `EndSleepSession`, `GetHistory`, `GetPreferences`, `UpdatePreferences` criados para orquestrar o domínio puramente em Java.
- **Web Contollers**: `SleepSessionController` e `PreferencesController` adicionados ao prefixo `/api/v1`.
- **Security**: Habiltiado JWKS URI (`spring.security.oauth2.resourceserver.jwt.jwk-set-uri`). Todo JWT é validado localmente pelo Spring Security sem state e sem requests adicionais ao Supabase.
- **Global Error Handling**: `GlobalExceptionHandler` configurado (`@RestControllerAdvice`) para varrer `DomainException` e `MethodArgumentNotValidException`, mapeando para status HTTP 400 uniformemente formatado.
- **Testes Unitários**: Criados testes para os Use Cases e Controllers (`@WebMvcTest` + MockMvc + Mock JWT auth). Total: **26 testes**.

---

## Etapa 4 — O que foi feito

### Resumo
- **Refatoração de Autenticação**: Substituído Magic Link por fluxo completo de Email/Senha (`signUp`, `signInWithPassword`).
- **Arquitetura de Layouts**: Implementada separação entre `PublicLayout` (Auth) e `PrivateLayout` (App Shell com Toolbar).
- **Roteamento Organizado**: Rotas aninhadas por layout; `/login` e `/register` são públicas, demais são protegidas por `AuthGuard`.
- **UX**: Adicionadas notas de privacidade e feedback visual (loading/snackbars) nos formulários de auth.
- **TDD**: Cobertura de testes para `AuthService`, `AuthGuard`, `LoginComponent`, `RegisterComponent` e Layouts (Vitest).

---

## Etapa 5 — O que foi feito

### Resumo
- **Preferências**: Criada página de configurações com formulário reativo para latência, duração do ciclo e limites de ciclos.
- **Histórico**: Implementada lista de sessões passadas com visualização de avaliação (estrelas) e notas.
- **Navegação Global**: Adicionado menu superior (Toolbar) fixo para transição entre as funcionalidades.
- **UX**: Melhorados feedbacks visuais de carregamento e mensagens de erro via SnackBar.
- **Roteamento**: Rotas `/history` e `/preferences` registradas e protegidas via `AuthGuard`.

---

## Env Vars

| Variável | Descrição | Onde usada |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Frontend (ETAPA 4) |
| `PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Chave publicável Supabase | Frontend (ETAPA 4) |
| `ANON_KEY` | JWT anon do Supabase | Frontend (ETAPA 4) |
| `DATABASE_URL` | JDBC URL do Postgres Supabase | Backend (ETAPA 2) |
| `DATABASE_USERNAME` | Usuário do banco | Backend (ETAPA 2) |
| `DATABASE_PASSWORD` | Senha do banco | Backend (ETAPA 2) |
| `SUPABASE_JWKS_URI` | Endpoint JWKS para validar JWTs (`/.well-known/jwks.json`) | Backend (ETAPA 3) |

---

## Comandos

```bash
# Rodar testes do backend (do diretório raiz)
cd backend
mvn test

# Rodar testes do módulo backend a partir da raiz
mvn -pl backend test

# Compilar sem rodar testes
mvn -pl backend compile -DskipTests

# Rodar a aplicação (ETAPA 2+, com banco configurado)
mvn -pl backend spring-boot:run
```

---

## Hurdles & Fixes

| Problema | Solução |
|---|---|
| Spring Boot auto-config falha sem datasource | Excluiu `DataSourceAutoConfiguration`, `HibernateJpaAutoConfiguration`, `FlywayAutoConfiguration`, `SecurityAutoConfiguration` em `application.properties` para ETAPA 1 |
| `.env.exemple` continha credenciais reais | Substituídas por placeholders; `.env` real criado e adicionado ao `.gitignore` |
| `SleepCycleCalculator` precisa ser testável sem Spring | Adotou domínio puro Java, sem injeção de dependência do framework; `SleepCycleCalculator` é instanciado diretamente no teste com `new` |
| Surefire não descobria classes `*IT` | Padrão do Surefire é `*Test`/`*Tests`; adicionado `<include>**/*IT.java</include>` na config do plugin |
| `@DynamicPropertySource` com datasource ausente | Criado `src/test/resources/application.properties` com placeholder values sobrescritos em runtime pelo Testcontainers |
| Docker indisponível na máquina de dev | Adicionado `@Testcontainers(disabledWithoutDocker = true)`: testes IT são `SKIPPED`, não `FAILED` |
| App falha ao iniciar em nova máquina (`SUPABASE_JWKS_URI` não resolvido) | Criado arquivo `.env` a partir do `.env.exemple`. Configurado `spring.config.import=optional:file:./.env[.properties],optional:file:../.env[.properties]` no `application.properties`. O sufixo `[.properties]` é mandatório para o Spring tratar arquivos `.env` sem extensão como formato de propriedades. |
| Frontend falhava o comando `ng build` | Rodado `npm install` localmente para instalar dependências e o Angular CLI no escopo do projeto |
| Warnings de imports não usados nos testes | Removidos imports de `WithMockUser` em `PreferencesControllerTest` e `SleepSessionControllerTest` que não estavam sendo utilizados. |
| Teste do Frontend falhando (`app.spec.ts`) | O teste falhava porque o `AuthService` não estava mockado e a toolbar (com o título) só renderiza se autenticado. Mockado `AuthService` no `app.spec.ts`. |
| Falta de guia para rodar local | Criado `LOCAL_SETUP.md` com instruções passo a passo para backend e frontend. |
| Erro de `./mvnw` (JAR ausente) | Restaurado `maven-wrapper.jar` usando `mvn wrapper:wrapper -Dtype=bin`. |
| Erro "missing table user_preferences" | O Flyway baselined em v1 e ignorou scripts. Corrigido com `baseline-version=0` e `hibernate.ddl-auto=update` no `application.properties`. |
| Erro "required a bean of type SleepCycleCalculator" | O serviço de domínio é "Pure Java" e não tinha anotação `@Service`. Criado `DomainConfig` para registrá-lo como bean. |
| `align="center"` inválido em `mat-card-actions` | A propriedade `align` só aceita `"start"` ou `"end"`. Corrigido para `"end"`. |
| Mock de `MatSnackBar` falha em standalone components | Standalone components podem re-prover o serviço via imports de módulos. Resolvido usando `TestBed.overrideComponent` com `add.providers`. |
| Redirecionamento cíclico no AuthGuard | Ajustada lógica de redirecionamento para garantir que usuário logado caia em `/home` e deslogado em `/login`. |

---

## Checklist Pós-ETAPA 2

- [x] Migrations Flyway criadas (V1 + V2)
- [x] JPA entities com mapeamento bidirecional (fromDomain/toDomain)
- [x] Domain port interfaces criadas (`application/port/`)
- [x] Configuração Flyway + Data JPA + Models de db (`infrastructure.persistence.entity`)
- [x] Repositories adapters (`infrastructure.persistence.adapter`)
- [x] Application Use Cases (interatores)
- [x] REST Controllers (`infrastructure.web.controller`) + GlobalExceptionHandler
- [x] Configuração Spring Security (JWKS do Supabase)
- [ ] Documentação Swagger/OpenAPI (Opcional)
- [ ] Endpoints de Autenticação / Webhook (Opcional, pois login é client-side no Supabase)tgreSQL)
- [x] Tests run: 15, Failures: 0, Errors: 0, Skipped: 7 ✅ (sem Docker)
- [x] `PROJECT.md` atualizado

---

## Roadmap das Etapas

- **ETAPA 1** ✅ Bootstrap backend + domínio + TDD
- **ETAPA 2** ✅ Persistência + Flyway migrations + repositories + Testcontainers
- **ETAPA 3** ✅ Use cases + controllers REST + validação JWT Supabase via JWKS
- **ETAPA 4** ✅ Bootstrap Angular + design system + Home (relógio UTC) + integração com endpoints
- **ETAPA 5** ✅ Preferences + History + UX (loading/error/empty states) + testes frontend
- **ETAPA 6** ✅ Sistema travado em defaults científicos (90 min) + Remoção de Preferences UI + Docs Finais

---

## Estado Atual do Sistema (LOCKED)

O sistema agora é **"Opinionated"**. Para garantir a integridade do estudo do sono, as seguintes métricas são fixas:
- **Ciclo de Sono**: 90 minutos (padrão ouro).
- **Latência**: 14 minutos (média para início do sono).
- **Duração Ideal**: 4 a 6 ciclos (6 a 9 horas de sono).
- **Sugestões**: Sempre centradas no ciclo 5 (7.5 horas).
- **Caducidade de Sessão**: Sessões superiores a 14 horas são consideradas inválidas (score 0) e não contam para o streak. Se houver uma sessão aberta há mais de 14h, o sistema permite iniciar uma nova, encerrando a anterior automaticamente.

---

## UI/UX Redesign (Dark Comfort) — 2026-03-09

### Design Decisions (Premium Refactor)

*   **Theme**: "Midnight Premium" - A refined dark mode using `#0B0F14` for deep backgrounds and `rgba(255,255,255,0.08)` for subtle borders.
*   **Typography**: **Plus Jakarta Sans** (chosen for its geometric precision and premium readability in tech-focused dark themes).
*   **Color Palette**:
    *   **Primary**: `#42D6C6` (Premium Teal).
    *   **Surface**: `#111826` (Clean elevated surfaces).
    *   **Status**: Ruby Red (`#FF5C7A`) for errors, Gold (`#FFC857`) for warnings.
*   **Inputs**: Modern outlined style with background `#0F1622`, focus glows, and secondary opacities for icons.
*   **Micro-interactions**: 150-250ms transitions, `scale(0.98)` on active state for buttons, and fade-in entry for cards.

### Current Status

- [x] Stage 1: Premium Login (Tokens, Typography, Component, Tests)
    - *Refinement*: Increased form gap (16-20px), refined focus glow (3px), fixed label clipping, and added safety margins to prevent field overlap.
- [x] Stage 2: Premium Register (Toggles, Error Banner, Signals)
- [x] Stage 3: Private Layout & App Shell (Glassmorphism, Fixed Nav Bar)
    - *Refinement*: Replaced floating mobile nav with a fixed glassmorphism bar for better UI integration.
- [x] Stage 4: Internal Screens & Clock (Refined Weight, No Glow, Harmonized Cards)
    - *Refinement*: Removed neon text-shadow from home clock and increased weight to 800 per user request. Harmonized Home, History, and Insights with the "Midnight Premium" palette.
- [x] Stage 5: Correct Bottom Nav & Safe Area (Layout fixes, Content Leakage, TDD)
    - *Refinement*: Implemented fixed bottom bar with safe-area support and increased glassmorphism opacity.

### Commands

*   `npm start`: Start the frontend development server.
*   `npm test -- --include src/app/pages/login/login.component.spec.ts`: Run login tests.

---

## CI/CD Etapa 1 — O que foi feito

### Resumo
- Criado workflow de CI do GitHub Actions (`.github/workflows/ci.yml`).
- Configurado Build & Test automatizado para Backend (Maven) e Frontend (Angular).
- Implementado sistema de **cache** para dependências (Maven e npm) para builds mais rápidos.
- Configurada publicação de **artefatos** (JAR do backend e dist do frontend) para cada execução do workflow.
- Corrigidos testes unitários e de layout que impediam o CI de passar.

### Decisões Técnicas
- **Java 21 (Temurin)** no CI: Garante compatibilidade com as metas do projeto, mesmo com ambiente local em Java 17.
- **Node 22 (LTS)** no CI: Versão estável recomendada para Angular 21.
- **Mocks nos Testes**: Adicionada env `SUPABASE_JWKS_URI` mockada no CI para evitar falhas de inicialização do contexto Spring nos testes de Controller.

---

## Hurdles & Fixes (CI/CD)

| Problema | Solução |
|---|---|
| `SleepCycleCalculatorTest` falhava com 5 sugestões em vez de 3 | O default de `minCycles` em `UserPreferences.java` era 2, mas os testes esperavam 4 (conforme regra LOCKED). Corrigido default para 4. |
| Teste de layout falhando (`.app-title` não encontrado) | O template usa `.brand-name`. Atualizado o seletor no arquivo `.spec.ts` do frontend. |
| Teste de layout falhando (`.mobile-nav` não encontrado) | O template usa `.mobile-nav-bar`. Atualizado o seletor no teste. |
| `ng test` falhava no modo manual | Configurado `npx vitest run` ou `npm test -- --watch=false` para execução única no CI. |
| Erro de sintaxe no `ci.yml` (`Unrecognized named-value: 'id'`) | A sintaxe correta para acessar outputs de steps é `steps.<id>.outputs.<nome>`. Corrigido de `id.meta.output` para `steps.meta.outputs`. |

---

## Checklist Pós-ETAPA 1 (CI/CD)

- [x] Diagnóstico do monorepo concluído
- [x] Testes de backend e frontend passando localmente
- [x] `.github/workflows/ci.yml` criado e funcional
- [x] Caches de dependências configurados
- [x] Upload de artefatos configurado (JAR + dist)
- [x] `PROJECT.md` atualizado com a Etapa 1

---

## Próximas Etapas (Roadmap CI/CD)
- **ETAPA 2**: Dockerizar backend (Dockerfile multi-stage) + healthcheck + ajustes env
- **ETAPA 3**: Publicar imagem no GHCR via GitHub Actions (tags: sha, latest) + doc de secrets
- **ETAPA 4**: Integração com Coolify (instruções e checklist: apontar para repo ou GHCR, setar env vars, ports, domain, SSL)
- **ETAPA 5**: Cloudflare Pages (preferir integração nativa; se Actions, configurar token e deploy)
- **ETAPA 6**: Hardening: branch protection, required checks, smoke tests pós-deploy (curl /actuator/health), rollback básico

---

## CI/CD Etapa 2 — O que foi feito

### Resumo
- Criado **Dockerfile multi-stage** para o backend (Build com Maven + Runtime com JRE 21).
- Adicionada dependência `spring-boot-starter-actuator` para viabilizar healthchecks.
- Configurado endpoint `/actuator/health` no `application.properties`.
- Implementado **Healthcheck no Dockerfile** usando `wget` para monitorar a integridade da aplicação containerizada.

### Decisões Técnicas
- **Dockerfile Multi-stage**: Reduz o tamanho da imagem final ao separar o ambiente de compilação (JDK + Maven) do ambiente de execução (JRE).
- **JRE 21 Jammy**: Base leve e segura para a execução do backend.
- **Spring Actuator**: Escolhido por ser o padrão de mercado para monitoramento em Spring Boot, integrando-se nativamente com orquestradores como Coolify/GHCR.

---

## Checklist Pós-ETAPA 2 (CI/CD)

- [x] Dockerfile multi-stage criado em `backend/`
- [x] Spring Actuator adicionado ao `pom.xml`
- [x] Endpoint de health configurado e exposto
- [x] Healthcheck nativo do Docker configurado
- [x] Build local do JAR verificado com novas dependências
- [x] `PROJECT.md` atualizado com a Etapa 2

---

## CI/CD Etapa 3 — O que foi feito

### Resumo
- Automatizada a publicação da imagem Docker do backend no **GitHub Container Registry (GHCR)**.
- Atualizado o workflow `.github/workflows/ci.yml` com um novo job `publish-docker`.
- Implementado sistema de **tagging automático**: cada imagem é tagueada com o SHA do commit e a tag `latest` (para pushes na `main`).
- Configuradas permissões granulares de pacotes (`packages: write`) no GitHub Actions.

### Decisões Técnicas
- **Job Separado**: O build do Docker roda apenas após o sucesso dos testes do backend (`needs: backend`), garantindo que apenas código estável seja transformado em imagem.
- **Docker Metadata Action**: Utilizada a action oficial para gerar tags semânticas e labels padronizadas automaticamente.

---

## Checklist Pós-ETAPA 3 (CI/CD)

- [x] Workflow de build/push Docker configurado no GitHub Actions
- [x] Login no GHCR via `GITHUB_TOKEN` validado
- [x] Tags `latest` e `${{ github.sha }}` implementadas
- [x] `PROJECT.md` atualizado com a Etapa 3

---

## CI/CD Etapa 4 — O que foi feito

### Resumo
- Elaborado o guia definitivo para deploy do backend no **Coolify v4 (v4.0.0-beta.463)**.
- Mapeadas todas as variáveis de ambiente baseadas no Supabase e infraestrutura atual.
- Configurada a integração com o **GHCR** para pull de imagens privadas (via Personal Access Token).
- Definida a estratégia de **Healthcheck** via Spring Actuator `/actuator/health`.

### Guia de Deploy (Snapshot)
1. **Recurso**: Docker Image -> `ghcr.io/hericlessssss/somnitide-backend:latest`.
2. **Porta**: Interna `8080` / Exposta via Traefik (HTTPS).
3. **Environment**: `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `SUPABASE_JWKS_URI`.
4. **Healthcheck**: Automático via `/actuator/health` (porta 8080).

---

## Checklist Pós-ETAPA 4 (CI/CD)

- [x] Guia de deploy Coolify v4 documentado
- [x] Variáveis de ambiente mapeadas
- [x] Estratégia de healthcheck validada no plano
- [x] `PROJECT.md` atualizado com a Etapa 4

---

## CI/CD Etapa 5 — O que foi feito

### Resumo
- Preparação do frontend para deploy no **Cloudflare Pages**.
- Criado o arquivo `frontend/public/_redirects` com a regra `/* /index.html 200`. Isso permite que o roteamento SPA (Angular) funcione corretamente ao recarregar a página sem causar erros 404.
- Elaborado o guia de configuração do Cloudflare Pages (Build configs, paths e env vars).

### Guia de Deploy Cloudflare Pages
1. **GitHub Connection**: Repositório público `hericlessssss/somnitide`.
2. **Root Directory**: `frontend`.
3. **Framework Preset**: `Angular`.
4. **Build Command**: `npm run build`.
5. **Build Directory**: `dist/frontend/browser`
6. **Env Vars**: Adicionar `API_URL` apontando para o backend no Coolify.

---

## Checklist Pós-ETAPA 5 (CI/CD)

- [x] Arquivo `_redirects` criado em `frontend/public/`
- [x] Configurações de build do Cloudflare Pages documentadas
- [x] Variáveis de ambiente de produção mapeadas
- [x] `PROJECT.md` atualizado com a Etapa 5

---

## CI/CD Etapa 6 — O que foi feito

### Resumo
- Implementado o **Job de Sucesso Unificado** (`ci-success`) no GitHub Actions. Este job consolida o status de todas as etapas (Backend, Docker Push e Frontend), servindo como o único "Required Status Check" necessário para proteção de branch.
- Documentadas as recomendações de **Branch Protection** no GitHub para garantir que a `main` nunca receba código quebrado.

### Recomendações de Hardening (GitHub Settings)
Para máxima segurança, configure as seguintes regras na branch `main`:
1. **Require a pull request before merging**: Ativar "Require approvals".
2. **Require status checks to pass before merging**: Pesquisar por `CI overall success` (o job que criamos).
3. **Require branches to be up to date before merging**.
4. **Do not allow bypassing the above settings**.

---

## Checklist Final de CI/CD
### Design Decisions (Premium Refactor)

*   **Theme**: "Midnight Premium" - A refined dark mode using `#0B0F14` for deep backgrounds and `rgba(255,255,255,0.08)` for subtle borders.
*   **Typography**: **Plus Jakarta Sans** (chosen for its geometric precision and premium readability in tech-focused dark themes).
*   **Color Palette**:
    *   **Primary**: `#42D6C6` (Premium Teal).
    *   **Surface**: `#111826` (Clean elevated surfaces).
    *   **Status**: Ruby Red (`#FF5C7A`) for errors, Gold (`#FFC857`) for warnings.
*   **Inputs**: Modern outlined style with background `#0F1622`, focus glows, and secondary opacities for icons.
*   **Micro-interactions**: 150-250ms transitions, `scale(0.98)` on active state for buttons, and fade-in entry for cards.

### Current Status

- [x] Stage 1: Premium Login (Tokens, Typography, Component, Tests)
    - *Refinement*: Increased form gap (16-20px), refined focus glow (3px), fixed label clipping, and added safety margins to prevent field overlap.
- [x] Stage 2: Premium Register (Toggles, Error Banner, Signals)
- [x] Stage 3: Private Layout & App Shell (Glassmorphism, Fixed Nav Bar)
    - *Refinement*: Replaced floating mobile nav with a fixed glassmorphism bar for better UI integration.
- [x] Stage 4: Internal Screens & Clock (Refined Weight, No Glow, Harmonized Cards)
    - *Refinement*: Removed neon text-shadow from home clock and increased weight to 800 per user request. Harmonized Home, History, and Insights with the "Midnight Premium" palette.
- [x] Stage 5: Correct Bottom Nav & Safe Area (Layout fixes, Content Leakage, TDD)
    - *Refinement*: Implemented fixed bottom bar with safe-area support and increased glassmorphism opacity.

### Commands

*   `npm start`: Start the frontend development server.
*   `npm test -- --include src/app/pages/login/login.component.spec.ts`: Run login tests.

---

## CI/CD Etapa 1 — O que foi feito

### Resumo
- Criado workflow de CI do GitHub Actions (`.github/workflows/ci.yml`).
- Configurado Build & Test automatizado para Backend (Maven) e Frontend (Angular).
- Implementado sistema de **cache** para dependências (Maven e npm) para builds mais rápidos.
- Configurada publicação de **artefatos** (JAR do backend e dist do frontend) para cada execução do workflow.
- Corrigidos testes unitários e de layout que impediam o CI de passar.

### Decisões Técnicas
- **Java 21 (Temurin)** no CI: Garante compatibilidade com as metas do projeto, mesmo com ambiente local em Java 17.
- **Node 22 (LTS)** no CI: Versão estável recomendada para Angular 21.
- **Mocks nos Testes**: Adicionada env `SUPABASE_JWKS_URI` mockada no CI para evitar falhas de inicialização do contexto Spring nos testes de Controller.

---

## Hurdles & Fixes (CI/CD)

| Problema | Solução |
|---|---|
| `SleepCycleCalculatorTest` falhava com 5 sugestões em vez de 3 | O default de `minCycles` em `UserPreferences.java` era 2, mas os testes esperavam 4 (conforme regra LOCKED). Corrigido default para 4. |
| Teste de layout falhando (`.app-title` não encontrado) | O template usa `.brand-name`. Atualizado o seletor no arquivo `.spec.ts` do frontend. |
| Teste de layout falhando (`.mobile-nav` não encontrado) | O template usa `.mobile-nav-bar`. Atualizado o seletor no teste. |
| `ng test` falhava no modo manual | Configurado `npx vitest run` ou `npm test -- --watch=false` para execução única no CI. |
| Erro de sintaxe no `ci.yml` (`Unrecognized named-value: 'id'`) | A sintaxe correta para acessar outputs de steps é `steps.<id>.outputs.<nome>`. Corrigido de `id.meta.output` para `steps.meta.outputs`. |

---

## Checklist Pós-ETAPA 1 (CI/CD)

- [x] Diagnóstico do monorepo concluído
- [x] Testes de backend e frontend passando localmente
- [x] `.github/workflows/ci.yml` criado e funcional
- [x] Caches de dependências configurados
- [x] Upload de artefatos configurado (JAR + dist)
- [x] `PROJECT.md` atualizado com a Etapa 1

---

## Próximas Etapas (Roadmap CI/CD)
- **ETAPA 2**: Dockerizar backend (Dockerfile multi-stage) + healthcheck + ajustes env
- **ETAPA 3**: Publicar imagem no GHCR via GitHub Actions (tags: sha, latest) + doc de secrets
- **ETAPA 4**: Integração com Coolify (instruções e checklist: apontar para repo ou GHCR, setar env vars, ports, domain, SSL)
- **ETAPA 5**: Cloudflare Pages (preferir integração nativa; se Actions, configurar token e deploy)
- **ETAPA 6**: Hardening: branch protection, required checks, smoke tests pós-deploy (curl /actuator/health), rollback básico

---

## CI/CD Etapa 2 — O que foi feito

### Resumo
- Criado **Dockerfile multi-stage** para o backend (Build com Maven + Runtime com JRE 21).
- Adicionada dependência `spring-boot-starter-actuator` para viabilizar healthchecks.
- Configurado endpoint `/actuator/health` no `application.properties`.
- Implementado **Healthcheck no Dockerfile** usando `wget` para monitorar a integridade da aplicação containerizada.

### Decisões Técnicas
- **Dockerfile Multi-stage**: Reduz o tamanho da imagem final ao separar o ambiente de compilação (JDK + Maven) do ambiente de execução (JRE).
- **JRE 21 Jammy**: Base leve e segura para a execução do backend.
- **Spring Actuator**: Escolhido por ser o padrão de mercado para monitoramento em Spring Boot, integrando-se nativamente com orquestradores como Coolify/GHCR.

---

## Checklist Pós-ETAPA 2 (CI/CD)

- [x] Dockerfile multi-stage criado em `backend/`
- [x] Spring Actuator adicionado ao `pom.xml`
- [x] Endpoint de health configurado e exposto
- [x] Healthcheck nativo do Docker configurado
- [x] Build local do JAR verificado com novas dependências
- [x] `PROJECT.md` atualizado com a Etapa 2

---

## CI/CD Etapa 3 — O que foi feito

### Resumo
- Automatizada a publicação da imagem Docker do backend no **GitHub Container Registry (GHCR)**.
- Atualizado o workflow `.github/workflows/ci.yml` com um novo job `publish-docker`.
- Implementado sistema de **tagging automático**: cada imagem é tagueada com o SHA do commit e a tag `latest` (para pushes na `main`).
- Configuradas permissões granulares de pacotes (`packages: write`) no GitHub Actions.

### Decisões Técnicas
- **Job Separado**: O build do Docker roda apenas após o sucesso dos testes do backend (`needs: backend`), garantindo que apenas código estável seja transformado em imagem.
- **Docker Metadata Action**: Utilizada a action oficial para gerar tags semânticas e labels padronizadas automaticamente.

---

## Checklist Pós-ETAPA 3 (CI/CD)

- [x] Workflow de build/push Docker configurado no GitHub Actions
- [x] Login no GHCR via `GITHUB_TOKEN` validado
- [x] Tags `latest` e `${{ github.sha }}` implementadas
- [x] `PROJECT.md` atualizado com a Etapa 3

---

## CI/CD Etapa 4 — O que foi feito

### Resumo
- Elaborado o guia definitivo para deploy do backend no **Coolify v4 (v4.0.0-beta.463)**.
- Mapeadas todas as variáveis de ambiente baseadas no Supabase e infraestrutura atual.
- Configurada a integração com o **GHCR** para pull de imagens privadas (via Personal Access Token).
- Definida a estratégia de **Healthcheck** via Spring Actuator `/actuator/health`.

### Guia de Deploy (Snapshot)
1. **Recurso**: Docker Image -> `ghcr.io/hericlessssss/somnitide-backend:latest`.
2. **Porta**: Interna `8080` / Exposta via Traefik (HTTPS).
3. **Environment**: `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `SUPABASE_JWKS_URI`.
4. **Healthcheck**: Automático via `/actuator/health` (porta 8080).

---

## Checklist Pós-ETAPA 4 (CI/CD)

- [x] Guia de deploy Coolify v4 documentado
- [x] Variáveis de ambiente mapeadas
- [x] Estratégia de healthcheck validada no plano
- [x] `PROJECT.md` atualizado com a Etapa 4

---

## CI/CD Etapa 5 — O que foi feito

### Resumo
- Preparação do frontend para deploy no **Cloudflare Pages**.
- Criado o arquivo `frontend/public/_redirects` com a regra `/* /index.html 200`. Isso permite que o roteamento SPA (Angular) funcione corretamente ao recarregar a página sem causar erros 404.
- Elaborado o guia de configuração do Cloudflare Pages (Build configs, paths e env vars).

### Guia de Deploy Cloudflare Pages
1. **GitHub Connection**: Repositório público `hericlessssss/somnitide`.
2. **Root Directory**: `frontend`.
3. **Framework Preset**: `Angular`.
4. **Build Command**: `npm run build`.
5. **Build Directory**: `dist/frontend/browser`
6. **Env Vars**: Adicionar `API_URL` apontando para o backend no Coolify.

---

## Checklist Pós-ETAPA 5 (CI/CD)

- [x] Arquivo `_redirects` criado em `frontend/public/`
- [x] Configurações de build do Cloudflare Pages documentadas
- [x] Variáveis de ambiente de produção mapeadas
- [x] `PROJECT.md` atualizado com a Etapa 5

---

## CI/CD Etapa 6 — O que foi feito

### Resumo
- Implementado o **Job de Sucesso Unificado** (`ci-success`) no GitHub Actions. Este job consolida o status de todas as etapas (Backend, Docker Push e Frontend), servindo como o único "Required Status Check" necessário para proteção de branch.
- Documentadas as recomendações de **Branch Protection** no GitHub para garantir que a `main` nunca receba código quebrado.

### Recomendações de Hardening (GitHub Settings)
Para máxima segurança, configure as seguintes regras na branch `main`:
1. **Require a pull request before merging**: Ativar "Require approvals".
2. **Require status checks to pass before merging**: Pesquisar por `CI overall success` (o job que criamos).
3. **Require branches to be up to date before merging`.
4. **Do not allow bypassing the above settings**.

---

## Checklist Final de CI/CD

- [x] CI (GitHub Actions) validado e funcional
- [x] Dockerfile multi-stage configurado
- [x] Publicação automatizada no GHCR
- [x] Guia de deploy Coolify (v4) documentado
- [x] Refatoração de fontes (-1)
- [x] Feature: Progresso (Sleep Score V1)
- [x] Refinamento UI/UX: Progresso (Padronização Midnight Premium)
- [x] Deploy Frontend (Cloudflare Pages) configurado com `_redirects`
- [x] Job de verificação unificada (`ci-success`) implementado
- [x] `PROJECT.md` atualizado com todas as etapas
- [x] Globalização de estilos de títulos (Padrão bold forte unificado)

---

## Integração Frontend-Backend e Swagger

### O que foi feito
- **Swagger UI**: Implementado usando `springdoc-openapi`. Disponível em `/swagger-ui.html`.
- **CORS Dinâmico**: O backend agora aceita a variável de ambiente `ALLOWED_ORIGINS` (lista separada por vírgulas).
- **Injeção de API_URL**: O frontend foi preparado para ter a URL da API injetada via `sed` no build.

### Configurações Necessárias (Produção Final)

#### 1. No Cloudflare (DNS & Segurança) 🟠
- **Registro A**: `somnitide-api` -> `201.23.78.147` (**Proxy Status: Proxied/Laranja**).
- **SSL/TLS -> Overview**: Modo **Flexible** (Obrigatório para funcionar na porta 80).
- **SSL/TLS -> Edge Certificates**: Ativar **Always Use HTTPS**.

#### 2. No Coolify (Backend) 🐳
- **Domains**: `http://somnitide-api.gratianovem.com.br` (Use apenas **HTTP** no painel).
- **Network -> Port Mappings**: Deve conter **`80:80`**.
- **Environment Variables**:
  - `ALLOWED_ORIGINS`: `https://somnitide.pages.dev,https://somnitide-api.gratianovem.com.br,http://localhost:4200`
  - `SPRING_PROFILES_ACTIVE`: `prod`

#### 3. No Cloudflare Pages (Frontend) ⚡
- **Build Command**: `sh inject-api-url.sh && npm run build`
- **Variáveis de Build**:
  - `API_URL`: (Deixe em branco para usar o padrão `https://somnitide-api.gratianovem.com.br`).

### Checklist de Validação
- [x] **Backend Health**: `https://somnitide-api.gratianovem.com.br/actuator/health` (Deve retornar UP).
- [x] **Swagger Docs**: `https://somnitide-api.gratianovem.com.br/swagger-ui.html` (Deve carregar com cadeado seguro).
- [x] **Frontend Login**: Tentar login em `https://somnitide.pages.dev/login`.

### Checklist Final de Integração


### Hurdles & Fixes
| Problema | Solução |
|---|---|
| Espaçamento duplo no mobile | Removido `padding: env(...)` do `body` global; agora o Header e a Bottom Nav (ou o Main Content) gerenciam suas próprias áreas seguras. |
| Testes Vitest falhando com `initTestEnvironment` | Ocorria ao rodar `npx vitest` direto; corrigido rodando via `ng test` ou `npm test -- --include ...` que inicializa o Angular corretamente. |

---

## UI/UX Refactor 2026-03-10

- [x] **ETAPA 5: Ajustar Sugestões** (Duração, Mais Opções, Pinned) - Concluído em 2026-03-11
- [x] **ETAPA 6: Performance pass** (Lighthouse + bundle stats) - Concluído em 2026-03-11
- [x] **REFINO: Centralização Login/Register** (Mobile & Desktop) - Concluído em 2026-03-11
4.  **Tamanho de Fontes**: Redução global de -1 nível (ex: 15px -> 14px) para melhor densidade em mobile. [2026-03-11]
5.  **Score de Sono (Progresso)**: Implementado Score V1 baseado em Duração (60pts), Qualidade (40pts) e Streak (10pts). Agrupamento por dia (UTC) com prioridade para a sessão mais longa do dia. [2026-03-11]
6.  **Refinamento UI/UX Progresso**: Harmonizada a página de Progresso com o tema "Midnight Premium". Centralização do layout (800px), uso de cards glassmorphism, avatar de sessão com cores semânticas e timeline de histórico idêntica à página de Histórico. [2026-03-11]
7.  **Métricas de Progresso**: Adicionado o "Total Somado" do período e validado o reset de streak para dias sem sessão (UTC). Cobertura de testes expandida para garantir integridade da lógica de consistência. [2026-03-11]
8.  **Globalização de Títulos e Estilos (Premium standardization)**: Padronização da hierarquia visual em todo o app. Títulos de página agora possuem `font-weight: 900` e efeito gradient unificado. Criação das classes globais `.section-title` e `.sub-section-title` para consistência em cards e listagens. [2026-03-13]

## Decisões Técnicas

- **Cálculo de minutos de sono**: Decidido usar `EndedAtUtc - SleepStartEstimatedAtUtc`. Mesmo que a latência seja estimada, ela reflete melhor o tempo real dormido do que o tempo total na cama.
- **Streak de Sono**: Calculado com base na continuidade de dias (UTC) com pelo menos uma sessão encerrada. Se o usuário não dormiu hoje ou ontem (UTC), o streak é zero.
- **Backend Architecture**: Mantido Domínio Puro para o `SleepProgressCalculator` para garantir testes instantâneos e isolados.

### Detalhes das Etapas (Continuação)

#### ETAPA 1: Refatoração UI/UX e Layout Base
- **Resumo:** Implementação de Bottom Navigation fixo com glassmorphism e tratamento de safe areas.
- **Destaque:** Uso de `env(safe-area-inset-bottom)` e token `--bottom-nav-height: 72px`.

#### ETAPA 2: Assessment Dialog
- **Resumo:** Upgrade completo do modal com clickable cards (`matRipple`) e sticky header/footer.
- **Hurdle:** Resolvido erro `TS2322` via `setAnswer()` method e limpeza de duplicação de classe.

#### ETAPA 3: Home Component
- **Resumo:** Adicionado fuso horário automático no relógio e grid responsivo de sugestões.
- **Técnica:** `Intl.DateTimeFormat().resolvedOptions().timeZone` para detecção local.

#### ETAPA 5: Ajustar Sugestões & Backend Defaults
- **Resumo:** Expansão das sugestões de sono e melhoria da legibilidade dos dados.
- **Destaque:** Backend atualizado para suportar 1-8 ciclos (antes 4-6). Frontend exibe duração como "7h 30min" em vez de decimal.

#### ETAPA 6: Performance Pass & Budgets
- **Resumo:** Análise de build production e recomendações de otimização.
- **Métricas:** 
  - Initial Bundle: 887.23 kB (Warning: > 500 kB).
  - Transfer Size: ~214 kB (Gzip/Brotli estimado).
- **Hurdles:** Orçamento de estilos do `HomeComponent` excedido em 546 bytes devido à complexidade do glassmorphism.

#### ETAPA 10: Correção de Pipeline (Backend)
- **Resumo:** Sincronização dos testes do backend com os novos padrões de domínio de ciclos de sono.
- **Fix:** Atualizado `minCycles` de 4 para 1 nos testes `GetPreferencesTest` e `UserPreferencesRepositoryIT`.
- **Resultado:** A pipeline voltará a ficar "verde", refletindo a nova regra de negócio que permite sessões de sono curtas (descanso mínimo).

### Performance Notes & Sugestões
1. **Bundle Size**: O bundle inicial está acima do desejado. Recomendado mover bibliotecas secundárias de UI para lazy chunks onde possível.
2. **CSS Optimization**: Extrair padrões repetidos de glassmorphism para utilitários globais (preparado hoje).
3. **Imagens**: Garantir que o ícone da marca (waves) seja um SVG otimizado.

### Hurdles & Fixes (2026-03-10/11)
| Problema | Solução |
|---|---|
| Teclado mobile cobria inputs | `PublicLayout` alterado para `min-height` + `overflow-y: auto`. |
| Erro TS2322 em rádios | Implementado `setAnswer()` para tipagem rigorosa. |
| Layout quebrando em resoluções < 360px | Refatoração dos cards de sugestão para usar flex-col em blocos de informação. |
| Timezone errada no herói | Injetado label dinâmico via `resolvedOptions().timeZone`. |
| Sugestões insuficientes | Backend defaults expandidos de 3 para 8 opções. |
| Desalinhamento Login/Cadastro | Removidas margens negativas residuais em `LoginComponent`. |
| Sessões "esquecidas" quebravam streak | Implementada lógica de invalidacao automática para sessões > 14h. |
| Inexistência de comunidade | Implementado Ranking Global, Perfis Públicos e handles únicos (@). |
| Inconsistência nos pesos e tamanhos de títulos | Criadas classes globais `.section-title` e `.sub-section-title` em `styles.css`. O título principal (`.page-title`) foi elevado para `font-weight: 900`. |

---

## Globalização de Estilos de Título ✅

### Resumo
- **Padronização Visual**: Unificação de todos os títulos de página e seções para seguir a identidade "Midnight Premium".
- **Refatoração Global**: Removidas definições locais de títulos nos componentes `Home`, `Ranking`, `Progress`, `Insights`, `History` e `Profile`.
- **CSS Tokens**: Implementadas classes utilitárias no `styles.css` para garantir que futuras páginas sigam automaticamente o padrão visual.

### Decisões Técnicas
- **Font-Weight 900 (Black)**: Corrigido o loading via `index.html` para garantir que o peso máximo seja realmente aplicado.
- **Efeito "Fat" (Gordinha)**: Adicionado `text-shadow: 0 0 1px currentColor` e `-webkit-font-smoothing: subpixel-antialiased` para maximizar a massa visual das fontes.
- **Degradê Reimplementado**: O gradiente foi restaurado nos títulos de página para manter a estética premium sem perder a força do negrito.
- **Hierarquia de Títulos**:
  - `.page-title` (3.6rem max, extra-bold 900, gradient) -> Presença massiva no topo.
  - `.section-title` (1.5rem, bold 900) -> Destaques internos reforçados.

### Refinamento Títulos "Extra-Bold Gradient" (2026-03-13)
- **O que foi feito**: Unificação visual de todos os títulos principais (`h1`) da aplicação para adotarem o estilo superdimensionado com gradiente e peso extra. As telas impactadas incluem: Home (relógio), Login, Registro, Docs, Perfil Público e Histórico.
- **Técnica CSS**: 
  - A classe `.gradient-text` recebeu um `filter: drop-shadow(...)` e `-webkit-text-stroke` para ampliar consideravelmente a espessura percebida do elemento mantendo o fundo gradiente de clipagem.
  - A classe `.page-title` teve seu tamanho ampliado (`clamp(2.6rem, 11vw, 3.6rem)`) e um `text-shadow` sutil adicionado.
- **Hurdles & Fixes**:
  - **Testes Falhando por Encoding**: O teste unitário do `HistoryComponent` quebrava ao comparar "Seu Histórico" pois antes dependia de uma string com double-encoding (`Seu Hist├│rico`). O `.spec.ts` foi atualizado para UTF-8 puro.
  - **Sobrescrita de Mock em Testes de Componentes Standalone**: O `HomeComponent` importava o `MatSnackBarModule` diretamente, o que estava sobrepondo a injeção do mock no `TestBed.configureTestingModule`. O problema foi corrigido utilizando `TestBed.overrideComponent(HomeComponent, { add: { providers: [ ... ] } })`.

### Ajustes Finos Títulos e Espaçamentos (2026-03-13)
- **Aumento de 10% nas Fontes**: Todos os títulos com estilo "Extra-Bold Gradient" tiveram um incremento adicional de tamanho (+10% em relação aos `clamp` originais) em `Home`, `Login`, `Registro`, `Docs`, `Perfil Público` e `Histórico`.
- **Aproximação Título/Subtítulo (Gap Global)**: O valor do token global CSS `--page-header-gap` foi reduzido pela metade (de `10px` para `5px` e forçado globalmente na classe `.page-subtitle`), colando visualmente o subtítulo ao título em todas as exibições dependentes de `PageHeader`.
- **Enforcing de Font-Weight e "Gordinho" Clássico**: Confirmado que a importação do pacote de pesos `700` e `800` da _Plus Jakarta Sans_ já estava presente na tag `<link>` raiz. Ajustado a classe base global `.page-title` para usar `font-weight: 800 !important`, garantindo que não há supressões acidentais por overrides padrão do Angular Material (`mat-typography`) que possam remover o feeling "gordinho" das fontes, ao mesmo tempo que mantém a consistência com o web deploy antigo.
- **Remoção de Efeitos Luminosos e Gradientes (Neon/Gradient)**: Eliminadas as propriedades de sombreamento (`drop-shadow`, `text-shadow`) atendendo à preferência por tipografia pura sem brilho ou reflexos. Além disso, a classe `.gradient-text` foi universalmente removida do projeto (em `Home`, `Login`, `Registro`, `Docs`, `Profile` e `PageHeader`), estabelecendo a cor primária sólida (`var(--color-primary)`) como o padrão absoluto para esses títulos de destaque. Testes unitários rodados com sucesso.
- **Alinhamento Simétrico de Container e Host Context**: Identificada uma regressão de posicionamento (padding/margens desalinhados à direita). Como custom elements (`<app-page-header>`, `<app-home>`) têm `display: inline` nativo no Angular, o flex container acaba desalinhando blocos filhos contra textos do header. Adicionada enforcing de `:host { display: block; width: 100%; }` em componentes base, aliado à padronização do `--page-padding-x` para `24px` e margin `0` nos `.mat-mdc-card`. Adicionalmente, foi removido um `@media (max-width: 600px)` no `HomeComponent.styles` que injetava um padding lateral redundante de 12px, garantindo que o alinhamento de 24px seja absoluto e estrito até nas menores telas mobile.
- **Movimentação da Seção "Science Brief"**: Conforme requisitado por fluxo elegante de navegação, o texto explicativo sobre "O SomniTide utiliza algoritmos..." foi extraído de dentro do `mat-card`, transformado em uma declaração *plain text* limpa (`.science-text`) com formatação tipográfica suave, e reinjetado **acima** do mostrador principal da Hora Atual na `Home`, antecipando o contexto científico para o usuário antes dele lidar com as sessões propriamente ditas.
---
