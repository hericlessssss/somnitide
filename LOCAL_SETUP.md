# Local Setup Guide - Somnitide

Follow these steps to run the Somnitide project (Spring Boot + Angular) on your local machine.

## Prerequisites

- **Java 21** or higher.
- **Node.js 20+** and **npm**.
- **Maven 3.9+** (or use the included `mvnw`).
- A **Supabase** project (credentials should be in `.env`).

---

## 1. Environment Configuration

Ensure you have a `.env` file in the root directory with the following variables:

```properties
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-key
ANON_KEY=your-anon-key

# Database (Supabase Postgres)
DATABASE_URL=jdbc:postgresql://db.your-project.supabase.co:5432/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
SUPABASE_JWKS_URI=https://your-project.supabase.co/auth/v1/keys
```

---

## 2. Running the Backend (Spring Boot)

**Important**: The `backend` is a Java/Maven project. Do **NOT** run `npm install` inside the `backend` folder.

From the root directory (`somnitide/`):

```bash
# Run tests to ensure everything is correct
./mvnw -pl backend test

# Start the application
./mvnw -pl backend spring-boot:run
```

The API will be available at `http://localhost:8080/api/v1`.

---

## 3. Running the Frontend (Angular)

From the `frontend` directory (`somnitide/frontend/`):

```bash
cd frontend

# Install dependencies (Required ONLY here)
npm install

# Start the development server
npm start
```

The application will be available at `http://localhost:4200`.

---

## 4. Database Migrations

The project uses **Flyway**. Migrations are automatically applied by the backend on startup. Check `backend/src/main/resources/db/migration` for the current schema.

---

## Troubleshooting

- **Prepared statement "S_1" already exists**:
  - **Causa**: O driver JDBC tenta usar cache de statements, mas o Pooler do Supabase (PgBouncer) em modo Transaction não permite.
  - **Solução**: Adicione `?prepareThreshold=0` ao final da sua `DATABASE_URL` no `.env`.

- **Found non-empty schema(s) "public" but no schema history table**:
  - **Causa**: Você já tem tabelas no banco (ex: Prisma), e o Flyway pararia por segurança.
  - **Solução**: Ativei `baseline-on-migrate=true` e `baseline-version=0` no `application.properties`. Isso garante que as migrações `V1` e `V2` rodem mesmo se o banco não estiver limpo.

- **JWT Unauthorized**: Ensure `SUPABASE_JWKS_URI` in `.env` is correct and exactly matches your Supabase project.
- **Database Connection**: Ensure your IP is allowed in Supabase settings or use the connection string provided in the Supabase dashboard.
- **Node Modules**: If the frontend fails to start, try deleting `node_modules` and `package-lock.json` and running `npm install` again.
