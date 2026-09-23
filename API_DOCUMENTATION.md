# ForgeTrack API Reference

This reference describes the API implemented in `backend/` as of the current codebase. It is intended as a working contract for an implementation agent. Do not infer endpoints, resource mutations, or validation rules that are not listed here.

## Quick start

- **Local base URL:** `http://localhost:3000/api`
- **Health check:** `GET http://localhost:3000/health` returns `{ "status": "ok" }`.
- **Interactive documentation:** `GET /api-docs` serves Swagger UI, but its route annotations are incomplete. This document is the fuller route reference.
- JSON endpoints consume and return `application/json`. The gallery-upload endpoint consumes `multipart/form-data`.
- Protected endpoints require `Authorization: Bearer <JWT>`.
- A local-login or invitation JWT expires after 7 days. A Google-login JWT expires after 1 day.

All protected data access is scoped to the JWT's `businessId`; clients must never send a `businessId` to choose a tenant.

### Roles

| Marking | Meaning |
| --- | --- |
| `Public` | No JWT required. |
| `Auth` | Any valid `admin` or `staff` JWT. |
| `Admin` | Valid JWT with `role: "admin"`. |

### Shared response conventions

Successful resource endpoints normally return:

```json
{ "status": 200, "data": {} }
```

Paginated lists add:

```json
"pagination": { "page": 1, "pageSize": 10, "total": 34, "totalPages": 4 }
```

Some auth and invitation endpoints instead use `{ "message": "..." }`, optionally with `token`, `user`, `membership`, or `data`. Deletions return `204 No Content`.

Common errors are `{ "message": "..." }`; authentication middleware sometimes uses `{ "error": "..." }`. Validation errors usually return HTTP 400 and:

```json
{
  "errors": [{ "type": "field", "msg": "...", "path": "field", "location": "body" }]
}
```

Malformed auth register/login bodies instead return `{ "error": "first validation message" }`.

## Authentication

### `POST /auth/register` — Public

Creates a new local account and its initial business/membership. Rate limit: 3 requests per IP per hour.

```json
{ "name": "Ada Lovelace", "email": "ada@example.com", "password": "S3cure!Pass" }
```

All fields are required and no extra fields are accepted. Passwords must be at least 8 characters and contain lower-case, upper-case, a digit, and a non-alphanumeric character. Returns `201` with `{ "user": User, "membership": Membership }`; it does **not** return a JWT. Duplicate email returns `400`.

### `POST /auth/login` — Public

Rate limit: 5 requests per IP per 15 minutes.

```json
{ "email": "ada@example.com", "password": "S3cure!Pass" }
```

Returns `200` with `{ "token": "<jwt>", "user": User }`. Invalid credentials and an attempt to password-login to a Google-only account return `401`.

### Google OAuth — Public

- `GET /auth/google` redirects to Google's consent flow.
- `GET /auth/google/callback?code=<provider-code>` exchanges the code, creates/updates the account, then redirects to `<FRONTEND_URL>/callback?token=<jwt>`.

### Password recovery — Public

| Method and path | Input | Result |
| --- | --- | --- |
| `POST /auth/forgot-password` | `{ "email": "ada@example.com" }` | Always returns 200 with a generic reset-link message when successful, avoiding account enumeration. Rate limit: 5 per 15 minutes. |
| `GET /auth/verify-password?token=<reset-token>` | query `token` | `200 { "valid": true }`, or `400` when invalid/expired. |
| `POST /auth/reset-password` | `{ "token": "...", "newPassword": "..." }` | `200` on reset; token and password required. The endpoint only checks minimum password length (8), unlike registration. |

### Current profile — Auth

- `GET /auth/me` is intended to return `200 { "status": 200, "data": User }`.
- `DELETE /auth/me` is Admin-only and removes the caller's membership from the current business, returning `204`.

**Current implementation warning:** locally issued JWTs do not contain `email`, while `GET /auth/me` looks up the user by `auth.email`. Therefore, this endpoint can return `404` after ordinary password login. Google-issued tokens include email. An agent should use the login response user or fix the backend before depending on `/auth/me` for local sessions.

## Users

All user routes are **Admin** and scoped to the current business.

| Method and path | Purpose | Inputs | Success |
| --- | --- | --- | --- |
| `GET /users/all` | List users | Optional `page` (default 1), `pageSize` (1–100, default 10), `role` (`admin`, `staff`, or `all`), `status` (`active` or `inactive`), `search` | `200` paginated `User[]`; each user has `memberships` and latest matching `invitation` or `null`. |
| `GET /users/:id` | Get one active business member | UUID path id | `200 {status,data:User}`; `404` if absent/not a member. |
| `POST /users/create` | Create account and membership | `name`, `email`, `password` (min 8); optional `role` | `201` with user. |
| `PATCH /users/:id` | Update user or their role in this business | One or more of `name`, `email`, `role` | `200` with user. |
| `DELETE /users/:id` | Remove membership | UUID path id | `204`. This is a membership removal, not a global user delete. |

`User` includes `id`, `name`, `email`, provider fields, timestamps, and memberships. Passwords are omitted. User creation only enforces password length, not the stronger registration password rules.

## Products

Product reads are **Auth**; create/update/delete are **Admin**. Product identifiers are UUIDs.

### Product object and write body

```json
{
  "name": "Safety Helmet",
  "description": "Class E helmet",
  "price": 49.99,
  "sku": "PPE-HELMET-001",
  "image": "https://cdn.example.com/helmet.jpg",
  "quantityInStock": 24,
  "supplierEmail": "supplier@example.com",
  "lowStockThreshold": 5
}
```

`name`, `description`, `price` (positive), `sku`, and `image` (valid URL) are required by the product validator. `quantityInStock` is optional, must be a non-negative integer, and defaults to 0. The shared model also supports optional `supplierEmail`, `lowStockThreshold` (default 0), and `lowStockAlertSentAt`; these are accepted by the service despite not being explicit in the Zod schema. Name and SKU must be unique within a business.

| Method and path | Access | Inputs | Success |
| --- | --- | --- | --- |
| `GET /products/all` | Auth | Optional `page`, `pageSize` (1–100) | 200 paginated products, sorted by name. |
| `GET /products/search?q=<text>` | Auth | Required non-blank `q` | 200 unpaginated products matching name, SKU, or description. |
| `GET /products/:id` | Auth | UUID path id | 200 product; 404 if outside business/absent. |
| `POST /products/create` | Admin | Product body | 201 product. |
| `PATCH /products/:id` | Admin | Product body | 200 product. **Although this is PATCH, the same schema requires all core product fields.** |
| `DELETE /products/:id` | Admin | UUID path id | 204. |

Creating an order or lowering stock can trigger a low-stock email when quantity crosses from above to at/below `lowStockThreshold` and a supplier email is configured.

## Orders

Order reads and creation are **Auth**. Status updates and deletion are **Admin**. Orders belong to the caller's membership/business.

### Create order

`POST /orders/create`

```json
{
  "items": [
    { "productId": "11111111-1111-1111-1111-111111111111", "quantity": 2 }
  ]
}
```

`items` must be non-empty; each UUID product ID and positive integer quantity is validated. Creation sets status to `pending`, uses the product's current price as `priceAtOrder`, and decrements stock atomically. Missing products return `404`; insufficient stock returns `400` with availability details.

| Method and path | Inputs | Success |
| --- | --- | --- |
| `GET /orders/all` | Optional `page`, `pageSize` (1–100), `status` (`pending`, `fulfilled`, `cancelled`) | 200 paginated orders, newest first. |
| `GET /orders/:id` | UUID path id | 200 order, or 404. |
| `POST /orders/create` | Create body above | 201 created order. |
| `PATCH /orders/:id/status` (Admin) | `{ "status": "pending" | "fulfilled" | "cancelled" }` | 200 updated order. |
| `DELETE /orders/:id` (Admin) | UUID path id | 204. |

Returned orders include `membership` (with creator `user`) and `orderItems`; each item includes its product's `id`, `name`, `price`, and `sku`. Deleting or cancelling an order does **not** restore stock in the present implementation.

## Dashboard

`GET /dashboard` is **Auth** and returns order/product aggregate data:

```json
{
  "status": 200,
  "data": {
    "summary": { "totalOrders": 12, "totalRevenue": 3400 },
    "ordersByStatus": { "pending": 2, "fulfilled": 9, "cancelled": 1 },
    "topProducts": [{ "productId": "...", "name": "...", "sku": "...", "totalQuantity": 10 }],
    "lowStockProducts": [{ "id": "...", "name": "...", "sku": "...", "quantityInStock": 2, "lowStockThreshold": 5 }]
  }
}
```

Implementation note: `totalRevenue` currently sums every order item if **any** fulfilled order exists; it does not restrict item revenue to fulfilled orders.

## Invitations

| Method and path | Access | Input | Success |
| --- | --- | --- | --- |
| `POST /invitation/send` | Admin | `{ "email": "new@example.com", "role": "staff" }`; role defaults to staff | 201 with invitation id/email/role/status/expiresAt; link token expires after 7 days. A duplicate pending invitation for the same email/business returns 409. |
| `POST /invitation/accept?token=<raw-token>` | Public | Body `{ "name": "...", "password": "..." }` for a new user | 200, creates/attaches the account and returns `token`, `user`, and `membership`. |
| `POST /invitation/revoke/:invitationId` | Admin | invitation id path parameter | 200 `{ "message": "Invitation revoked" }`. |

**Broken route warning:** `POST /invitation/decline` is registered without a `:token` parameter, but its controller reads `req.params.token`. It will always return `400 { "message": "Token is required" }`. There is currently no usable decline endpoint.

## Engineering domain

Every engineering endpoint below requires **Auth** only. The route layer does not currently restrict engineering writes to admins. All outputs use `{ "status", "data" }` unless stated otherwise.

### Inventory

| Method and path | Input | Success |
| --- | --- | --- |
| `GET /engineering/inventory` | Optional `q`; searches name, specification, SKU, and description case-insensitively | 200 `InventoryItem[]`, newest updated first, including `site` and `equipmentAsset`. |
| `POST /engineering/inventory` | Body below | 201 item including `site` and `equipmentAsset`; 409 on a unique-name/SKU conflict, 400 otherwise. |

```json
{
  "name": "Concrete mixer",
  "specification": "120 L, 240 V",
  "category": "equipment",
  "quantityOnHand": 1,
  "reorderPoint": 0,
  "description": "Portable mixer",
  "sku": "EQ-MIX-120",
  "referenceDocumentUrl": "https://example.com/manual.pdf",
  "supplierName": "Tool Supply Co.",
  "supplierEmail": "orders@example.com",
  "siteId": "<site-uuid>",
  "serialNumber": "SN-12345",
  "condition": "good",
  "calibrationDueAt": "2026-12-01T00:00:00.000Z"
}
```

Required in practice: `name`, `specification`, and `category`. Categories are `consumable`, `tool`, and `equipment`. For non-consumables, supplying `serialNumber`, `condition`, or `calibrationDueAt` also creates an `equipmentAsset`. No request validation middleware protects this route, so clients should send values matching this contract exactly.

### Sites and projects

| Method and path | Input | Success |
| --- | --- | --- |
| `GET /engineering/sites` | None | 200 sites, sorted by name. |
| `GET /engineering/projects` | None | 200 projects, including `site` and `allocations.inventoryItem`, newest updated first. |
| `POST /engineering/projects` | `{ "name": "...", "code": "...", "description": "...", "customerName": "...", "status": "planned", "siteId": "...", "startDate": "ISO-8601", "endDate": "ISO-8601" }` | 201 project. Status: `planned`, `active`, `on_hold`, `completed`, or `cancelled`; referenced site must belong to the business. |
| `POST /engineering/project-allocations` | `{ "projectId": "...", "inventoryItemId": "...", "quantity": 3 }` | 201 allocation. Quantity must be integer ≥1 and no greater than current quantity on hand. A non-checkout allocation for the same project/item is incremented rather than duplicated. |

There is no `POST /engineering/sites` route. A site can be created implicitly by field-gallery upload; otherwise it must already exist in the database.

### Team and checkouts

| Method and path | Input | Success |
| --- | --- | --- |
| `GET /engineering/team-members` | None | 200 active business members: `id`, `name`, `email`. |
| `GET /engineering/checkouts` | None | 200 open, partially-returned, or overdue checkouts; includes borrower, project, and items with inventory records. Returned checkouts are excluded. |
| `POST /engineering/checkouts` | Body below | 201 checkout with its items. |

```json
{
  "borrowerId": "<user-uuid>",
  "projectId": "<project-uuid>",
  "expectedReturnAt": "2026-10-01T17:00:00.000Z",
  "notes": "Return after commissioning",
  "items": [{ "inventoryItemId": "<inventory-uuid>", "quantity": 1 }]
}
```

An item may appear once only. Every item must exist in the business and have enough stock. Creation decrements `quantityOnHand` and records a stock movement. The code does not currently validate that `borrowerId` or optional `projectId` belongs to the business before Prisma writes it.

### Field visits, individual photos, and gallery uploads

| Method and path | Input | Success |
| --- | --- | --- |
| `GET /engineering/field-visits` | None | 200 visits with site, project, engineer (`id`, `name`), photos (with site), and reports. |
| `POST /engineering/field-visits` | `{ "title": "...", "siteId": "...", "projectId": "...", "notes": "..." }` | 201 field visit; engineer is the caller. Default status is `planned`. |
| `POST /engineering/field-photos` | JSON body below | 201 field photo. The referenced visit must belong to the business. |
| `POST /engineering/field-gallery` | Multipart body below | 201 `{ data: { visit, site, photos } }`; uses Cloudinary. |

Individual field photo body:

```json
{
  "fieldVisitId": "<visit-uuid>",
  "storageUrl": "https://storage.example.com/image.jpg",
  "originalName": "photo.jpg",
  "mimeType": "image/jpeg",
  "capturedAt": "2026-09-22T12:00:00.000Z",
  "latitude": 6.5244,
  "longitude": 3.3792,
  "issueType": "corrosion",
  "notes": "Surface corrosion near joint",
  "metadata": { "source": "mobile" }
}
```

Gallery multipart fields:

- `images`: one to 20 file parts (each up to 4 MiB), sent under the exact field name `images`.
- `location`: required non-empty text. The server finds or creates a site with this exact name in the current business.
- `category`: optional text; defaults to `other`.
- `note`: optional text.

The server creates an `in_progress` visit titled `Gallery upload - <location>` and one photo record per uploaded image. Failed Cloudinary upload rolls back the newly created visit, but images already uploaded to Cloudinary may remain there.

## Agent integration rules and known gaps

1. Store the JWT returned by login or invitation acceptance, then attach it to every protected call. Do not try to supply user/business IDs for tenant selection.
2. Use UUID values for all `:id` product/order/user paths and every resource reference. These routes validate UUID path parameters, but most engineering JSON bodies are not validated at the HTTP layer.
3. Send complete product bodies on `PATCH /products/:id`; it is not a partial-update schema.
4. Do not expect generic CRUD for engineering entities. There are no update/delete routes for engineering inventory, projects, sites, checkouts, field visits, or gallery photos; there is no checkout-return route.
5. Avoid `/auth/me` for local-token session restoration until its JWT/profile lookup mismatch is fixed. The login response is the reliable source of the current user.
6. Do not use invitation decline until the route/controller parameter mismatch is corrected.
7. The app-level 100-per-15-minute rate limiter is registered **after** route handlers, so it may not effectively limit normal API routes. Endpoint-specific register/login/reset limiters are registered correctly.