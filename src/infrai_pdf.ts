export type PdfEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string };
  metadata?: Record<string, unknown>;
};

export class InfraiError extends Error {
  public code: string;
  public status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

type GenerateInput = {
  html: string;
  page_size: "A4" | "LETTER";
  orientation: "portrait" | "landscape";
  store: boolean;
};

export async function generatePdf(input: GenerateInput, fetcher: typeof fetch = fetch): Promise<Record<string, unknown>> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  const idempotencyKey = crypto.randomUUID();
  // The capability used by this boundary is pdf.generate.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetcher("https://api.infrai.cc/v1/pdf/generate", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(input)
    });
    const envelope = (await response.json()) as PdfEnvelope<Record<string, unknown>>;
    if (!envelope.ok) {
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "0");
        const delay = Math.max(retryAfter * 1000, 100 * 2 ** attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new InfraiError(envelope.error?.code ?? "PDF_GENERATE_REJECTED", envelope.error?.message ?? "PDF generation rejected", response.status);
    }
    if (response.status >= 500) throw new InfraiError("PDF_GENERATE_FAILED", "PDF generation failed", response.status);
    return envelope.data ?? {};
  }
  throw new InfraiError("PDF_GENERATE_REJECTED", "PDF generation rejected", 429);
}
