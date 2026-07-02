import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { QuickbooksClient } from "../clients/quickbooks-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

/**
 * Download an estimate PDF from QuickBooks Online and save it to disk.
 * Output dir comes from QBO_PDF_OUTPUT_DIR (falls back to the OS temp dir).
 * Returns the absolute saved path.
 */
export async function getQuickbooksEstimatePdf(
  estimateId: string,
  filename?: string
): Promise<ToolResponse<{ path: string; bytes: number }>> {
  try {
    const quickbooks = await QuickbooksClient.getInstance();
    const outDir = process.env.QBO_PDF_OUTPUT_DIR || os.tmpdir();
    const safeBase = (filename || `Estimate_${estimateId}`)
      .replace(/\.pdf$/i, "")
      .replace(/[^A-Za-z0-9._ -]/g, "_")
      .slice(0, 120);
    const outPath = path.join(outDir, `${safeBase}.pdf`);

    return new Promise((resolve) => {
      quickbooks.getEstimatePdf(estimateId, (err: any, pdf: any) => {
        if (err) {
          resolve({ result: null, isError: true, error: formatError(err) });
          return;
        }
        try {
          const buf = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);
          fs.mkdirSync(outDir, { recursive: true });
          fs.writeFileSync(outPath, buf);
          resolve({
            result: { path: outPath, bytes: buf.length },
            isError: false,
            error: null,
          });
        } catch (writeErr) {
          resolve({ result: null, isError: true, error: formatError(writeErr) });
        }
      });
    });
  } catch (error) {
    return { result: null, isError: true, error: formatError(error) };
  }
}
