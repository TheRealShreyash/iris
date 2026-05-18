# Iris

**A lightweight, fast OpenID Connect (OIDC) provider built on Bun & Express**

## What is Iris?

Iris is a self-hosted OpenID Connect identity provider that lets you add standards-compliant authentication to any application. It implements the **Authorization Code Flow** and issues RS256-signed JWTs, making it compatible with any OIDC-aware client.

---

## Features

- **OIDC Authorization Code Flow** — Full implementation including auth codes, access tokens, and refresh tokens
- **RS256 JWT Signing** — Asymmetric key signing with public JWKS endpoint for token verification
- **Multi-client Support** — Register and manage multiple OAuth2 client applications
- **Email Verification** — Built-in email verification flow using Mailtrap
- **Secure by Design** — Passwords hashed with HMAC-SHA256 + random salts; client secrets stored as SHA256 hashes; refresh tokens rotated on every use
- **OpenID Discovery** — Exposes a `/.well-known/openid-configuration` endpoint for automatic client configuration
- **Screaming Fast** — Powered by the Bun runtime

---

## Tech Stack

| Layer        | Technology                               |
| ------------ | ---------------------------------------- |
| Runtime      | [Bun](https://bun.sh/)                   |
| Framework    | [Express](https://expressjs.com/)        |
| Database ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| Database     | PostgreSQL                               |
| Auth         | RS256 JWTs via `jsonwebtoken` + `jose`   |
| Validation   | [Zod](https://zod.dev/)                  |
| Email        | Nodemailer + Mailtrap                    |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- PostgreSQL database
- An RSA key pair for JWT signing (see [Key Setup](#key-setup))
- A [Mailtrap](https://mailtrap.io/) account for email delivery

### Installation

```bash
git clone https://github.com/your-username/iris.git
cd iris
bun install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=9090
ISSUER=http://localhost:9090

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/iris

# JWT
JWT_EMAIL_VERIFICATION_SECRET=your-super-secret-string

# Email (Mailtrap)
SMTP_TOKEN=your-mailtrap-token
```

### Key Setup

Iris requires an RSA key pair for signing JWTs. Place your keys in a `certs/` directory:

```bash
# Generate a private key
openssl genrsa -out certs/private.pem 2048

# Extract the public key
openssl rsa -in certs/private.pem -pubout -out certs/public.pem
```

Iris expects these to be exported from `certs/keys.ts` as `PRIVATE_KEY` and `PUBLIC_KEY`.

### Database Migration

```bash
bun run db:push
```

### Run

```bash
bun run dev     # Development
bun run start   # Production
```

The server will start on `http://localhost:9090`.

---

## API Reference

### OpenID Discovery

| Endpoint                            | Method | Description                        |
| ----------------------------------- | ------ | ---------------------------------- |
| `/.well-known/openid-configuration` | `GET`  | OIDC discovery document            |
| `/auth/certs`                       | `GET`  | Public JWKS for token verification |

### Auth Endpoints

| Endpoint                     | Method | Description                                                     |
| ---------------------------- | ------ | --------------------------------------------------------------- |
| `/auth/authenticate`         | `GET`  | Renders the sign-in page                                        |
| `/auth/authenticate/signup`  | `GET`  | Renders the sign-up page                                        |
| `/auth/authenticate/sign-in` | `POST` | Validates credentials and returns an auth code                  |
| `/auth/authenticate/sign-up` | `POST` | Registers a new user                                            |
| `/auth/token`                | `POST` | Exchanges an auth code for access + refresh tokens              |
| `/auth/refresh-token`        | `POST` | Rotates a refresh token and returns new tokens                  |
| `/auth/userinfo`             | `GET`  | Returns the authenticated user's claims                         |
| `/auth/logout`               | `POST` | Invalidates the user's refresh token                            |
| `/auth/client-metadata`      | `GET`  | Returns public info about a registered client                   |
| `/auth/verify-email`         | `GET`  | Verifies a user's email from the link in the verification email |
| `/auth/resend-verification`  | `POST` | Resends the verification email                                  |

### Admin Endpoints

| Endpoint                 | Method | Description                               |
| ------------------------ | ------ | ----------------------------------------- |
| `/admin/register`        | `GET`  | Renders the client registration form      |
| `/admin/register-client` | `POST` | Registers a new OAuth2 client application |

---

## Authorization Code Flow

```
Client App                    Iris                          User
    │                           │                              │
    │── GET /auth/authenticate ─▶│                              │
    │      ?clientId=xxx         │── Render login page ────────▶│
    │                           │                              │
    │                           │◀─ POST /auth/authenticate/sign-in (email, password, clientId)
    │                           │                              │
    │                           │── Validate credentials        │
    │                           │── Issue auth code             │
    │◀─ { redirectUri + code } ─│                              │
    │                           │                              │
    │── POST /auth/token ───────▶│                              │
    │   (clientId, clientSecret, code)                         │
    │                           │── Validate code & secret      │
    │◀─ { accessToken, refreshToken }                          │
    │                           │                              │
    │── GET /auth/userinfo ─────▶│                              │
    │   Authorization: Bearer <accessToken>                    │
    │◀─ { sub, email, name, ... }                              │
```

---

## Database Schema

Iris uses three tables:

**`users`** — Stores user accounts with hashed passwords, salts, and refresh tokens.

**`clients`** — Stores registered OAuth2 client applications with their `clientId`, hashed `clientSecret`, and allowed `redirectUri`.

**`auth_codes`** — Short-lived (5-minute) authorization codes that bind a user to a client during the token exchange.

---

## Security Notes

- Passwords are hashed using **HMAC-SHA256** with a per-user random salt.
- Client secrets are stored as **SHA256 hashes** — the plaintext is only returned once at registration.
- Refresh tokens are **rotated** on every use and stored as SHA256 hashes.
- Access tokens expire in **15 minutes**; refresh tokens in **24 hours**.
- Auth codes expire in **5 minutes** and are deleted immediately upon use.

---

## Project Structure

```
iris/
├── certs/               # RSA key pair (private + public)
├── db/
│   ├── index.ts         # Drizzle database connection
│   └── schema.ts        # Table definitions
├── public/              # Static HTML pages (login, signup, register-client, error)
├── src/
│   ├── app/
│   │   └── index.ts     # Express app factory
│   ├── common/
│   │   ├── middlewares/ # Validation, authentication middlewares
│   │   └── utils/       # ApiResponse, ApiError helpers
│   └── modules/
│       ├── auth/        # Auth controller, routes, services, models, token utils
│       └── admin/       # Admin controller, routes, services, models
└── server.ts            # HTTP server entry point
```

---

## Supported OIDC Claims

| Claim           | Description                                           |
| --------------- | ----------------------------------------------------- |
| `iss`           | Token issuer URL                                      |
| `sub`           | User's unique ID                                      |
| `email`         | User's email address                                  |
| `emailVerified` | Whether the email has been verified                   |
| `given_name`    | User's first name                                     |
| `family_name`   | User's last name                                      |
| `name`          | User's full name                                      |
| `picture`       | Profile picture URL _(reserved, not yet implemented)_ |

---

<div align="center">

Built with ♥ using Bun, Express, and Drizzle.

</div>
