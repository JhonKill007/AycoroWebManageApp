# AT-79 — Dominios bloqueados (Manage)

## Navegación

- Menú: **Seguridad → Dominios bloqueados**
- Ruta: `/security/blocked-email-domains`
- Permiso UI + ManageApi: `MANAGE_SETTINGS` (`p12`)

## Flujo

```
Manage Web → ManageApi `/api/blocked-email-domains`
          → AycoroWebApi `/api/v3/BlockedEmailDomain*` (AT-81)
```

El navegador no llama a WebApi directamente. ManageApi reenvía con el JWT Aycoro (`X-Aycoro-Token` → `Authorization: Bearer`).

## Endpoints ManageApi

| Método | Ruta | Upstream AT-81 |
|--------|------|----------------|
| GET | `/api/blocked-email-domains` | `GET /api/v3/BlockedEmailDomain` |
| GET | `/api/blocked-email-domains/:id` | `GET /api/v3/BlockedEmailDomain/{id}` |
| POST | `/api/blocked-email-domains` | `POST /api/v3/BlockedEmailDomain` |
| PUT | `/api/blocked-email-domains/:id` | `PUT /api/v3/BlockedEmailDomain/{id}` |
| POST | `/api/blocked-email-domains/:id/activate` | `.../activate` |
| POST | `/api/blocked-email-domains/:id/deactivate` | `.../deactivate` |

La validación definitiva, normalización, caché e índice único siguen en AT-81.

## Pendiente AT-80

Informes / ops sobre intentos de registro o cambio de correo rechazados por dominio bloqueado.
