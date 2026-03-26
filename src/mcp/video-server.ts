#!/usr/bin/env node

/**
 * ZkTerminal Video MCP Server
 *
 * An MCP (Model Context Protocol) server that allows AI agents to
 * generate, manage, and purchase videos via ZkTerminal.
 *
 * Usage:
 *   ZKTERMINAL_API_KEY=sk_agent_xxx npx tsx src/mcp/video-server.ts
 *
 * Or add to Claude Desktop / any MCP client config:
 *   {
 *     "mcpServers": {
 *       "zkterminal-video": {
 *         "command": "npx",
 *         "args": ["tsx", "src/mcp/video-server.ts"],
 *         "env": { "ZKTERMINAL_API_KEY": "sk_agent_xxx", "ZKTERMINAL_API_BASE": "https://zkterminal.zkagi.ai" }
 *       }
 *     }
 *   }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const API_KEY = process.env.ZKTERMINAL_API_KEY || '';
const API_BASE = process.env.ZKTERMINAL_API_BASE || 'https://zkterminal.zkagi.ai';

if (!API_KEY) {
  console.error('Error: ZKTERMINAL_API_KEY environment variable is required');
  process.exit(1);
}

async function apiCall(method: string, path: string, body?: unknown) {
  const url = `${API_BASE}/api/agent${path}`;
  const headers: Record<string, string> = {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json();
}

const server = new Server(
  {
    name: 'zkterminal-video',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'generate_video',
      description:
        'Generate an AI video on a given topic. Returns a video ID to track progress. Videos cost $5 for the full version; a free 5-second watermarked preview is always available.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          topic: {
            type: 'string',
            description: 'The topic/prompt for the video (e.g. "Explain quantum computing in 60 seconds")',
          },
          mode: {
            type: 'string',
            enum: ['standard', 'story'],
            description: 'Video mode. "standard" for direct presentation, "story" for narrative style. Default: standard',
          },
          voice: {
            type: 'string',
            enum: ['pad', 'paw', 'custom'],
            description: 'Voice style. Default: pad',
          },
          format: {
            type: 'string',
            enum: ['16:9', '9:16'],
            description: 'Video aspect ratio. 16:9 for landscape, 9:16 for portrait/mobile. Default: 16:9',
          },
          customInstructions: {
            type: 'string',
            description: 'Optional custom instructions for video generation',
          },
        },
        required: ['topic'],
      },
    },
    {
      name: 'get_video_status',
      description:
        'Check the status of a video generation job. Returns status (QUEUED, PROCESSING, RENDERING, COMPLETED, FAILED), preview URL, and download URL if paid.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          videoId: {
            type: 'string',
            description: 'The video ID returned from generate_video',
          },
        },
        required: ['videoId'],
      },
    },
    {
      name: 'purchase_video',
      description:
        'Get a Stripe checkout URL to purchase the full video ($5). The user must complete payment at the returned URL. After payment, the full video download URL becomes available.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          videoId: {
            type: 'string',
            description: 'The video ID to purchase',
          },
          successUrl: {
            type: 'string',
            description: 'URL to redirect to after successful payment',
          },
          cancelUrl: {
            type: 'string',
            description: 'URL to redirect to if payment is cancelled',
          },
        },
        required: ['videoId'],
      },
    },
    {
      name: 'list_videos',
      description: 'List all previously generated videos with their statuses and payment info.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          limit: {
            type: 'number',
            description: 'Max number of videos to return. Default: 20',
          },
        },
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'generate_video': {
        const result = await apiCall('POST', '/video', {
          topic: args?.topic,
          mode: args?.mode || 'standard',
          voice: args?.voice || 'pad',
          format: args?.format || '16:9',
          customInstructions: args?.customInstructions,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_video_status': {
        const result = await apiCall('GET', `/video/${args?.videoId}`);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'purchase_video': {
        const result = await apiCall('POST', `/video/${args?.videoId}`, {
          successUrl: args?.successUrl,
          cancelUrl: args?.cancelUrl,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'list_videos': {
        const limit = args?.limit || 20;
        const result = await apiCall('GET', `/video?limit=${limit}`);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ZkTerminal Video MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
