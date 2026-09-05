import assert from "node:assert/strict";
import { certificateHtml } from "./certificate_service.ts";

const html = certificateHtml({ tenantId: "tenant-7", participantName: "Mina Ortiz", courseName: "Admin basics", completedOn: "2026-09-02" });
assert.match(html, /Mina Ortiz/);
assert.match(html, /Admin basics/);
assert.match(html, /Tenant: tenant-7/);
console.log("certificate decision test passed");
