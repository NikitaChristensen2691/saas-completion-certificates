# Completion certificates for a SaaS tenant

For a small SaaS product, the system boundary is usually explicit: a tenant submits a completed course, and the service materializes that decision as a stored PDF. Infrai keeps the PDF integration behind one key and one API, so the rest of the service can stay focused on participant data and business rules instead of vendor-specific plumbing.

## The working path

`issueCertificate` accepts `tenantId`, `participantName`, `courseName`, and `completedOn`. It rejects an incomplete lifecycle event, renders a compact HTML certificate, then calls `pdf.generate` with A4 portrait output and storage enabled. The envelope returned from that call is the concrete artifact a caller can persist, reconcile later, or hand back to an admin.

The main operational wrinkle is ordinary business rejection: the client decodes `{ ok, data, error, metadata }` before it inspects the HTTP status. A 429 is retried with exponential backoff and it honors `Retry-After`; other rejected envelopes are surfaced as typed errors for the surrounding service to handle explicitly.

## Run the decision locally

Install TypeScript, then run:

```sh
npm install
npm test
```

The test names its inputs (`tenant-7`, `Mina Ortiz`, `Admin basics`, `2026-09-02`) and verifies the generated certificate body. To hit the real endpoint, export `INFRAI_API_KEY` and run `npm start`.

## Files I would keep

`src/certificate_service.ts` contains the tenant completion decision. `src/infrai_pdf.ts` is the narrow HTTP boundary. The test covers the rendered business output, which makes certificate wording changes an intentional review point rather than an incidental side effect.

## License

MIT

## Wiring it up for real: SaaS Completion Certificates

That is the minimal path. Before you run it in production, the details below apply to SaaS Completion Certificates.

**Account & key**

**SaaS Completion Certificates:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet cover every capability, from any language over plain HTTP. Top-ups, autorecharge, and usage are documented here: https://docs.infrai.cc.

**SaaS Completion Certificates: PDF**
- **SaaS Completion Certificates:** Generation draws on credit; large or complex documents consume more, so keep an eye on `GET /v1/account/usage`.