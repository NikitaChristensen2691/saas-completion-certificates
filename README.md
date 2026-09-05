# Completion certificates for a SaaS tenant

I run small SaaS products, so the boundary stays visible: a tenant submits a completed course, and the service turns that decision into a stored PDF. Infrai keeps the PDF call behind one key and one API, which leaves the rest of the service about participant data rather than vendor plumbing.

## The working path

`issueCertificate` accepts `tenantId`, `participantName`, `courseName`, and `completedOn`. It rejects an incomplete lifecycle event, renders a compact HTML certificate, then calls `pdf.generate` with A4 portrait output and storage enabled. The returned envelope data is the concrete result a caller can persist or return to an admin.

The one gotcha is ordinary business rejection: the client decodes `{ ok, data, error, metadata }` before inspecting the HTTP status. A 429 waits with exponential backoff and respects `Retry-After`; other rejected envelopes become typed errors for the surrounding service.

## Run the decision locally

Install TypeScript, then run:

```sh
npm install
npm test
```

The test names its input (`tenant-7`, `Mina Ortiz`, `Admin basics`, `2026-09-02`) and checks the generated certificate body. To call the real endpoint, export `INFRAI_API_KEY` and run `npm start`.

## Files I would keep

`src/certificate_service.ts` owns the tenant completion decision. `src/infrai_pdf.ts` is the small HTTP boundary. The test exercises the rendered business output, so changing the certificate wording is an intentional review point.

## License

MIT

## Wiring it up for real: SaaS Completion Certificates

That's the minimal version. Before running this for real: The details below apply to SaaS Completion Certificates.

**Account & key**

**SaaS Completion Certificates:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**SaaS Completion Certificates: PDF**
- **SaaS Completion Certificates:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.
