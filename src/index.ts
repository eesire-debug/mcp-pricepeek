import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Platform API interfaces
interface ProductResult {
  title: string;
  price: number;
  platform: string;
  url: string;
  commission?: number;
  available: boolean;
}

interface SearchResult {
  success: boolean;
  query: string;
  results_count: number;
  data: ProductResult[];
  error?: string;
}

// Mock data — replace with real API calls
async function searchTaobao(query: string, limit: number): Promise<ProductResult[]> {
  // TODO: integrate 淘宝联盟 API (https://open.taobao.com/)
  return [
    {
      title: `${query} — 淘宝推荐`,
      price: 0,
      platform: "淘宝",
      url: `https://s.taobao.com/search?q=${encodeURIComponent(query)}`,
      available: false,
    },
  ];
}

async function searchJD(query: string, limit: number): Promise<ProductResult[]> {
  // TODO: integrate 京东联盟 API (https://union.jd.com/)
  return [
    {
      title: `${query} — 京东推荐`,
      price: 0,
      platform: "京东",
      url: `https://search.jd.com/Search?keyword=${encodeURIComponent(query)}`,
      available: false,
    },
  ];
}

async function searchPinduoduo(query: string, limit: number): Promise<ProductResult[]> {
  // TODO: integrate 多多进宝 API
  return [
    {
      title: `${query} — 拼多多推荐`,
      price: 0,
      platform: "拼多多",
      url: `https://youhui.pinduoduo.com/search/search?keyword=${encodeURIComponent(query)}`,
      available: false,
    },
  ];
}

async function searchAllPlatforms(
  query: string,
  platforms: string[],
  limit: number
): Promise<ProductResult[]> {
  const results: ProductResult[] = [];

  const tasks: Promise<ProductResult[]>[] = [];
  if (platforms.includes("taobao") || platforms.includes("all")) {
    tasks.push(searchTaobao(query, limit));
  }
  if (platforms.includes("jd") || platforms.includes("all")) {
    tasks.push(searchJD(query, limit));
  }
  if (platforms.includes("pinduoduo") || platforms.includes("all")) {
    tasks.push(searchPinduoduo(query, limit));
  }

  const settled = await Promise.allSettled(tasks);
  for (const s of settled) {
    if (s.status === "fulfilled") {
      results.push(...s.value);
    }
  }

  // Sort by price ascending, unavailable items last
  return results
    .filter((r) => r.available)
    .sort((a, b) => a.price - b.price)
    .slice(0, limit);
}

const TOOLS = [
  {
    name: "search_products",
    description:
      "Search for a product across multiple Chinese e-commerce platforms (Taobao, JD, Pinduoduo) and return price-sorted results with affiliate links.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Product name or keyword to search for" },
        platforms: {
          type: "array",
          items: { type: "string", enum: ["taobao", "jd", "pinduoduo", "all"] },
          default: ["all"],
          description: "Which platforms to search",
        },
        limit: { type: "number", default: 10, description: "Maximum number of results per platform" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_lowest_price",
    description: "Get the single lowest price for a product across all available platforms.",
    inputSchema: {
      type: "object",
      properties: {
        product_name: { type: "string", description: "Exact product name to find the lowest price for" },
      },
      required: ["product_name"],
    },
  },
  {
    name: "get_affiliate_link",
    description: "Convert a Taobao/JD product URL to an affiliate link with commission info.",
    inputSchema: {
      type: "object",
      properties: {
        product_url: { type: "string", description: "Original product URL from Taobao or JD" },
        platform: { type: "string", enum: ["taobao", "jd"], default: "taobao" },
      },
      required: ["product_url"],
    },
  },
];

const server = new Server(
  { name: "mcp-pricepeek", version: "0.1.0" },
  {
    capabilities: { tools: {} },
  }
);

server.setRequestHandler(ListToolsRequestSchema, () => {
  return { tools: TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (name === "search_products") {
      const { query, platforms = ["all"], limit = 10 } = args as {
        query: string;
        platforms?: string[];
        limit?: number;
      };
      const results = await searchAllPlatforms(query, platforms, limit);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                query,
                results_count: results.length,
                data: results,
              } as SearchResult,
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === "get_lowest_price") {
      const { product_name } = args as { product_name: string };
      const results = await searchAllPlatforms(product_name, ["all"], 20);
      const lowest = results.filter((r) => r.available).sort((a, b) => a.price - b.price)[0];
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                product_name,
                lowest: lowest || null,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === "get_affiliate_link") {
      const { product_url, platform = "taobao" } = args as { product_url: string; platform?: string };
      // TODO: implement real affiliate link conversion via API
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              error: "affiliate_api_not_implemented",
              message: "Affiliate link conversion requires API credentials. Please set TAOBAO_APPKEY / TAOBAO_APPSECRET environment variables.",
              original_url: product_url,
              platform,
            }),
          },
        ],
      };
    }

    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error}` }],
      isError: true,
    };
  }
);

const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);
