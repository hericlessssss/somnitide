# PROJECT.md — Documentação Viva do Somnitide

> Atualizado após: **ETAPA 2 — Persistência + Flyway + Repositories + Testcontainers**

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
- **Bootstrap Angular**: Inicializado projeto Angular 17+ em `frontend/` com componentes standalone e roteamento.
- **Design System**: Angular Material adicionado (Indigo-Pink theme) para uma experiência premium.
- **Integração Supabase**: Cliente Supabase configurado via `@supabase/supabase-js`.
- **Autenticação**: `AuthService` reativo com Signals e `AuthGuard` para proteção de rotas.
- **Home Page**: Implementada com layout Material, relógio em tempo real, botões de ação (Vou dormir/Acordei) e visualização de sugestões.
- **Conexão Backend**: `ApiService` centralizado que injeta o JWT automaticamente em todas as chamadas.

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
| `SUPABASE_JWKS_URI` | Endpoint JWKS para validar JWTs | Backend (ETAPA 3) |

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
- **ETAPA 5** 🔲 Preferences + History + UX (loading/error/empty states) + testes frontend
- **ETAPA 6** 🔲 CI (lint/test/build) + docs finais + hardening
