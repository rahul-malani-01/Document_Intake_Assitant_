# Production Readiness & Architecture Notes

This application was developed as a technical test demonstrating core LLM reliability, state separation, and deterministic generation[cite: 4]. If deploying this system to a high-scale, production-grade legal/financial environment, the following improvements would be prioritized[cite: 4]:

---

### 1. Authentication, Authorization & Tenant Isolation
- **User Identity:** Integrate OAuth 2.0 / OIDC authentication (via Clerk, Auth0, or Supabase Auth).
- **Access Control:** Enforce tenant isolation so sessions and state are bound to verified user IDs (`session.userId === req.user.id`).
- **CSRF & Security Headers:** Implement `helmet` for HTTP header hardening and use signed, HTTP-only cookies for session tokens.

### 2. Database Concurrency & Atomicity
- **ACID Transactions:** Wrap message logging, LLM proposal merging, and state persistence inside a MongoDB multi-document transaction (`session.withTransaction`). This prevents partial state updates if persistence fails midway.
- **Optimistic Locking:** Add a `version` field to `DocumentState` to avoid race conditions if multiple turns or rapid edits are sent simultaneously.
- **Compound Indexing:** Add indexes on `{ sessionId: 1, createdAt: -1 }` on `Message` to optimize conversational history pagination for long sessions.

### 3. LLM Observability & Cost Tracking
- **Telemetry & Tracing:** Integrate open-source LLM observability (e.g. Langfuse, Helicone, or OpenTelemetry) to log token usage, latency percentiles, and schema rejection rates.
- **Prompt Versioning:** Separate prompt templates from source code into versioned assets or a prompt management registry to facilitate A/B testing and prompt regression benchmarking.
- **Provider Fallback Diversity:** Implement cross-provider fallbacks (e.g. falling back from Google Gemini to Anthropic Claude or OpenAI) to protect against single-provider cloud outages[cite: 4].

### 4. Privacy, Security & Data Retention
- **PII Encryption at Rest:** Personally Identifiable Information (full legal names, residential addresses, children's identities) should be encrypted at the field level using AES-256-GCM envelope encryption before writing to MongoDB.
- **Automated Data Purging (TTL):** Implement MongoDB TTL (Time-To-Live) indexes to automatically purge unfinalized intake sessions after 30 days of inactivity.
- **Redaction Middleware:** Mask credit card numbers, tax IDs, or government credentials from LLM prompt inputs if accidentally entered by users.

### 5. Final Document Generation & Human-in-the-Loop Sign-off
- **PDF Compilation:** Integrate server-side PDF generation (e.g., PDFKit, Puppeteer, or Typst) to export print-ready documents with verifiable digital signatures.
- **Lock State:** Once the user reviews and confirms the draft, transition the session status to `finalized`, disabling further LLM mutations and locking the structured state against changes without explicit administrative unlock.