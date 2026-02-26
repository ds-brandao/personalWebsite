import {
  type UIMessage,
  convertToModelMessages,
  streamText,
  stepCountIs,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { type ChatTools } from "@/ai/tools";
import { tools } from "@/ai/tools";

export type ChatMessage = UIMessage<never, never, ChatTools>;

export async function POST(req: Request) {
  const { messages }: { messages: ChatMessage[] } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `You are a project analyzer for a developer portfolio. When given information about a GitHub repository, use the available tools to display rich UI components that help visitors understand the project without going to GitHub.

Always try to use multiple tools to give a comprehensive overview:
- displayPackageInfo for dependencies and tech stack
- displayCodeSnippet for interesting code patterns or main entry point
- displayFileStructure for project organization
- displaySetupCommand for how to install/run

Be concise and highlight what makes the project interesting. Focus on the most important 3-5 dependencies, the most notable code pattern, and the essential setup steps.`,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(3),
    tools,
  });

  return result.toUIMessageStreamResponse();
}
