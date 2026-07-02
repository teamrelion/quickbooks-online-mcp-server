import { sendQuickbooksEstimate } from "../handlers/send-quickbooks-estimate.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "send_estimate";
const toolDescription =
  "Email an estimate PDF to the customer via QuickBooks Online's native send. " +
  "OUTWARD-FACING: get the user's explicit approval before calling. " +
  "estimate_id is the QB internal Id (not the DocNumber). send_to overrides " +
  "the recipient; if omitted, QBO sends to the estimate's BillEmail address.";
const toolSchema = z.object({
  estimate_id: z.string(),
  send_to: z.string().email().optional(),
});

const toolHandler = async (args: any) => {
  const response = await sendQuickbooksEstimate(
    args.params.estimate_id,
    args.params.send_to
  );
  if (response.isError) {
    return { content: [{ type: "text" as const, text: `Error sending estimate: ${response.error}` }] };
  }
  return {
    content: [
      { type: "text" as const, text: `Estimate emailed:` },
      { type: "text" as const, text: JSON.stringify(response.result) },
    ],
  };
};

export const SendEstimateTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
};
