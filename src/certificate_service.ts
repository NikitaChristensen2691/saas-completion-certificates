import { generatePdf } from "./infrai_pdf.ts";
import { z } from "zod";

export type CertificateRequest = {
  tenantId: string;
  participantName: string;
  courseName: string;
  completedOn: string;
};

export const certificateRequestSchema = z.object({
  tenantId: z.string().min(1),
  participantName: z.string().min(1),
  courseName: z.string().min(1),
  completedOn: z.string().date()
});

export function certificateHtml(input: CertificateRequest): string {
  return `<main><h1>Certificate of completion</h1><p>${input.participantName}</p><p>completed ${input.courseName}</p><p>${input.completedOn}</p><small>Tenant: ${input.tenantId}</small></main>`;
}

export async function issueCertificate(input: CertificateRequest) {
  const parsed = certificateRequestSchema.parse(input);
  return generatePdf({ html: certificateHtml(parsed), page_size: "A4", orientation: "portrait", store: true });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await issueCertificate({ tenantId: "acme", participantName: "Rae Chen", courseName: "Onboarding", completedOn: "2026-09-02" });
  console.log(JSON.stringify(result));
}
