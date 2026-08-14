# Role-Based Access Control (RBAC) & Role Aliases

## Architecture Overview

E3 Qatar uses a two-tier RBAC system designed to maintain strict database enum stability while offering fine-grained administrative role capabilities in the application layer.

---

## 1. Database Enum (`RoleType`)

The database layer stores roles defined in `prisma/schema.prisma`:

```prisma
enum RoleType {
  SUPER_ADMIN
  SALES_ADMIN
  SUPPORT_ADMIN
  STAFF
  CLIENT
  CANDIDATE
}
```

> [!IMPORTANT]
> **Database Enum Invariance**:
> The `RoleType` enum in `schema.prisma` is never modified or expanded without formal database migrations to avoid breaking existing production database records, foreign keys, and third-party integrations.

---

## 2. Functional Application Roles & Aliases

To support granular administrative delegation without database schema migrations, `src/lib/permissions.ts` defines and handles functional role aliases:

| Role Name | Scope / Purpose | Database Backing Enum | Default Capabilities |
| :--- | :--- | :--- | :--- |
| **`SUPER_ADMIN`** | Full system owner, root administrative access | `SUPER_ADMIN` | Wildcard `*` (All permissions) |
| **`SALES_ADMIN`** | B2B sales pipeline, CRM leads, proposals | `SALES_ADMIN` | `crm.*`, `b2b.*`, `media.read` |
| **`SUPPORT_ADMIN`** | Customer support, ticket resolution, audit read | `SUPPORT_ADMIN` | `crm.inquiries.manage`, `audit.read` |
| **`B2C_ADMIN`** *(Alias)* | B2C attractions, packages, calendar, live feed | Maps to `STAFF` / `SUPPORT_ADMIN` with capabilities | `b2c.*`, `media.manage` |
| **`B2B_ADMIN`** *(Alias)* | B2B services, case studies, client showcase | Maps to `SALES_ADMIN` with capabilities | `b2b.*`, `media.manage` |
| **`HR_ADMIN`** *(Alias)* | Careers portal, talent evaluations, employee roster | Maps to `STAFF` with capabilities | `hr.*`, `team.manage` |
| **`OPERATIONS_ADMIN`** *(Alias)* | Temporal rules, ticketing gates, broadcast alerts | Maps to `STAFF` / `SUPPORT_ADMIN` with capabilities | `operations.*` |
| **`STAFF`** | Internal team member base role | `STAFF` | Portal read, assigned operational tasks |
| **`CLIENT`** / **`BUSINESS_USER`** *(Alias)* | External B2B client portal access | `CLIENT` | `client.*`, view own company documents/RFP |
| **`CANDIDATE`** | Job applicant portal | `CANDIDATE` | `candidate.*`, view own applications |

---

## 3. Permission Evaluation Flow

Permissions are evaluated using `hasPermission(role, capability, action)` in `src/lib/permissions.ts`:

1. **Direct Wildcard**: If the role has `*`, permission is immediately granted.
2. **Exact Match**: Direct check against capability string (e.g., `'b2c.attractions.manage'`).
3. **Prefix Wildcard**: Evaluation of domain wildcards (e.g., `'b2c.*'` matches any `'b2c.<resource>.<action>'`).
4. **Action:Resource Format**: Backward-compatible evaluation of legacy action permissions (e.g., `'manage:b2c'`).

---

## 4. Security Guarantees

- Unauthenticated requests are immediately denied (`false`).
- Unknown roles default to an empty permission set.
- Critical operations (`rbac.manage`, `settings.gateway.manage`) strictly require `SUPER_ADMIN` or explicit wildcard rights.
