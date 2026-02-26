import { type InferUITools, type ToolSet, tool } from "ai";
import { z } from "zod";

export const tools = {
  displayPackageInfo: tool({
    description:
      "Display package/dependency information for a project. Use when the project has notable dependencies, frameworks, or libraries worth highlighting.",
    inputSchema: z.object({
      name: z.string().describe("Package or project name"),
      currentVersion: z.string().optional().describe("Current version"),
      description: z
        .string()
        .optional()
        .describe("Short description of the package"),
      dependencies: z
        .array(
          z.object({
            name: z.string(),
            version: z.string().optional(),
          })
        )
        .describe("Key dependencies to highlight"),
    }),
    execute: async (input) => input,
  }),

  displayCodeSnippet: tool({
    description:
      "Display a key code snippet from the project. Use to highlight interesting implementation details, main entry points, or notable patterns.",
    inputSchema: z.object({
      filename: z.string().describe("The filename to display"),
      language: z
        .string()
        .describe("Programming language for syntax highlighting"),
      code: z.string().describe("The code content to display"),
    }),
    execute: async (input) => input,
  }),

  displayFileStructure: tool({
    description:
      "Display the project file/directory structure. Use to give an overview of how the project is organized.",
    inputSchema: z.object({
      files: z
        .array(
          z.object({
            path: z.string(),
            type: z.enum(["file", "folder"]),
          })
        )
        .describe("Array of file/folder entries"),
    }),
    execute: async (input) => input,
  }),

  displaySetupCommand: tool({
    description:
      "Display setup/installation commands for the project. Use to show how to get started with the project.",
    inputSchema: z.object({
      command: z.string().describe("The command to display"),
      label: z.string().optional().describe("Optional label for the command"),
    }),
    execute: async (input) => input,
  }),
} satisfies ToolSet;

export type ChatTools = InferUITools<typeof tools>;
