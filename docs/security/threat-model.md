# Threat Model & Privacy Posture

## Maryland Dental Access Navigator

**Version:** 1.0
**Date:** February 2026
**Status:** Active

---

## 1. System Overview

The platform helps Maryland residents (primarily Medicaid and uninsured patients) find dental care. It collects anonymous intake data, runs a matching algorithm, and presents clinic recommendations.

### Key Characteristics

- **No user accounts** — sessions are anonymous
- **No authentication for patients** — admin-only auth
- **Sensitive data**: location (ZIP/lat-lng), insurance status, health complaints
- **Third-party integrations**: Supabase (DB), SMS/email providers (future)

---

## 2. Data Classification

| Data Type                 | Classification       | Storage                     | Notes                                   |
| ------------------------- | -------------------- | --------------------------- | --------------------------------------- |
| ZIP code                  | Low sensitivity      | Plaintext                   | Public data                             |
| Lat/Lng coordinates       | Medium sensitivity   | **Rounded to ~1mi**         | Prevents re-identification to household |
| Chief complaint           | Medium sensitivity   | Plaintext enum              | No free text in v1                      |
| Insurance type/plan       | Medium sensitivity   | Plaintext enum              |                                         |
| Phone/email (opt-in)      | **High sensitivity** | **Encrypted at rest (KMS)** | Only in contact_preferences             |
| Session browsing behavior | Low sensitivity      | Plaintext                   | No PII in events                        |
| Clinic data               | Public               | Plaintext                   | Provider directory info                 |

### PII Handling Rules

1. **Lat/Lng rounding**: All coordinates rounded to 2 decimal places (~1.1km / 0.7mi) before storage. Never store raw GPS coordinates.
2. **No free-text PII**: Intake uses enum-only fields. No names, addresses, or SSNs collected.
3. **Contact encryption**: Phone and email in `contact_preferences` encrypted with KMS envelope encryption. Decryption only at send time.
4. **No cross-session linking**: Sessions have no user ID. Cannot correlate sessions to individuals.

---

## 3. Threat Analysis

### 3.1 Data Exposure

| Threat                                | Likelihood | Impact | Mitigation                                                          |
| ------------------------------------- | ---------- | ------ | ------------------------------------------------------------------- |
| Database breach exposing session data | Low        | Medium | Lat/lng rounding, no PII in sessions, encryption for contact fields |
| API response leaking raw coordinates  | Medium     | Medium | API serializers strip raw lat/lng; only return rounded values       |
| Logs containing PII                   | Medium     | Low    | Structured logging with PII field blocklist                         |

### 3.2 Abuse & Misuse

| Threat                           | Likelihood | Impact | Mitigation                                                             |
| -------------------------------- | ---------- | ------ | ---------------------------------------------------------------------- |
| Scraping clinic data             | Medium     | Low    | Rate limiting, WAF (PR-PLAT-006)                                       |
| Fake outcome submissions         | Medium     | Medium | Rate limiting per session, data_quality_flag field, admin review queue |
| Bot flood on intake API          | Medium     | Medium | Rate limiting, bot protection (PR-PLAT-006)                            |
| SMS/email spam via notifications | Low        | High   | Explicit opt-in required, feature-flagged, throttled sends             |

### 3.3 Triage Safety

| Threat                                     | Likelihood | Impact       | Mitigation                                                                                        |
| ------------------------------------------ | ---------- | ------------ | ------------------------------------------------------------------------------------------------- |
| Patient with emergency not routed to ED    | Low        | **Critical** | Server-side triage red-flag evaluator (PR-BE-002), hard-coded rules, cannot be bypassed by client |
| Stale clinic data causing wrong referral   | Medium     | High         | Freshness scoring, verification queues, staleness penalties                                       |
| Patient relying on platform instead of 911 | Low        | Critical     | Global disclaimer on every page, triage screen blocks results for emergencies                     |

---

## 4. Data Retention Policy

| Data Type            | Retention                           | Deletion Method                            |
| -------------------- | ----------------------------------- | ------------------------------------------ |
| Sessions             | 180 days                            | Automated deletion job (PR-SEC-003)        |
| Outcomes             | 180 days                            | Cascading delete with session              |
| Behavior events      | 90 days                             | Automated deletion job                     |
| Contact preferences  | 90 days or after follow-up complete | Automated deletion job                     |
| Notifications sent   | 90 days                             | Content hash only (no message body stored) |
| Clinic data          | Indefinite                          | Admin-managed                              |
| Sources/verification | Indefinite                          | Admin-managed                              |

---

## 5. Access Controls

| Role              | Scope                                  | Authentication                  |
| ----------------- | -------------------------------------- | ------------------------------- |
| Anonymous patient | Read recommendations for own session   | Session token (UUID, no auth)   |
| Admin (editor)    | CRUD clinic data, view outcomes        | Auth + RBAC (PR-BE-009)         |
| Admin (viewer)    | Read-only admin access                 | Auth + RBAC                     |
| System (worker)   | Process match jobs, send notifications | Service account / internal only |

### API Authorization Rules

- Patient endpoints (`/sessions`, `/recommendations`): Session-scoped, no cross-session access
- Admin endpoints (`/admin/*`): Require authenticated admin session with role check
- Worker endpoints: Internal-only, not exposed to public internet

---

## 6. Security Requirements Backlog

These are implemented across the PR backlog:

- **PR-SEC-002**: KMS-backed encryption for contact fields
- **PR-SEC-003**: Data retention + deletion jobs
- **PR-PLAT-006**: WAF + rate limiting + bot protection
- **PR-BE-002**: Triage red-flag evaluator (safety-critical)
- **PR-BE-009**: Admin auth middleware + RBAC
