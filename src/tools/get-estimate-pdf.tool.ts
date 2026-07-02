import { getQuickbooksEstimatePdf } from "../handlers/get-quickbooks-estimate-pdf.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get_estimate_pdf";
const toolDescription =
  "Download an estimate's PDF from QuickBooks Online and save it to disk. " +
  "estimate_id is the QB internal Id (not the DocNumber). Optional filename " +
  "names the saved file (e.g. 'Estimate_1065_CI'). Returns the absolute saved " +
  "path. To share the PDF as a chat attachment, include MEDIA:<saved path> " +
  "on its own line in your reply.";
const toolSchema = z.object({
  estimate_id: z.string(),
  filename: z.string().optional(),
});

const toolHandler = async (args: any) => {
  const response = await getQuickbooksEstimatePdf(
    args.params.estimate_id,
    args.params.filename
  );
  if (response.isError) {
    return { content: [{ type: "text" as const, text: `Error downloading estimate PDF: ${response.error}` }] };
  }
  const { path: savedPath, bytes } = response.result!;
  return {
    content: [
      {
        type: "text" as const,
        text:
          `Estimate PDF saved: ${savedPath} (${bytes} bytes). ` +
          `To attach it in chat, include this line in your reply:\nMEDIA:${savedPath}`,
      },
    ],
  };
};

export const GetEstimatePdfTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
};
