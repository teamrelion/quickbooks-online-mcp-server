import { QuickbooksClient } from "../clients/quickbooks-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

/**
 * Email an estimate PDF from QuickBooks Online (Intuit's native send).
 * If sendTo is omitted, QBO uses the estimate's BillEmail.EmailAddress.
 */
export async function sendQuickbooksEstimate(
  estimateId: string,
  sendTo?: string
): Promise<ToolResponse<any>> {
  try {
    const quickbooks = await QuickbooksClient.getInstance();

    return new Promise((resolve) => {
      const callback = (err: any, estimate: any) => {
        if (err) {
          resolve({
            result: null,
            isError: true,
            error: formatError(err),
          });
        } else {
          resolve({
            result: estimate,
            isError: false,
            error: null,
          });
        }
      };
      if (sendTo) {
        quickbooks.sendEstimatePdf(estimateId, sendTo, callback);
      } else {
        quickbooks.sendEstimatePdf(estimateId, callback);
      }
    });
  } catch (error) {
    return {
      result: null,
      isError: true,
      error: formatError(error),
    };
  }
}
