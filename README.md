# mcp-pricepeek

> MCP server for real-time price comparison across Chinese e-commerce platforms.

**MCP (Model Context Protocol)** skill for AI agents to look up and compare product prices from Taobao, JD.com, Pinduoduo, and more.

## Features

- **Multi-platform search** — Query prices from major Chinese e-commerce sites in one shot
- **Price ranking** — Sort results by lowest price automatically
- **Affiliate links** — Returns purchasable links (Taobao affiliate / JD联盟)
- **Price alerts** — Track price changes for specific products

## Installation

```bash
npm install -g mcp-pricepeek
```

## Usage

```javascript
// Via MCP client
{
  "name": "pricepeek",
  "command": "npx",
  "args": ["-y", "mcp-pricepeek"]
}

// Or globally installed
{
  "name": "pricepeek",
  "command": "mcp-pricepeek"
}
```

## Tools

### `search_products`

Search for a product across multiple e-commerce platforms.

```json
{
  "query": "iPhone 15 128GB",
  "platforms": ["taobao", "jd", "pinduoduo"],
  "limit": 10
}
```

Returns:

```json
{
  "products": [
    {
      "title": "Apple iPhone 15 128GB 黑色",
      "price": 4599,
      "platform": "taobao",
      "url": "https://s.click.taobao.com/...",
      "commission": 46.00
    }
  ]
}
```

### `get_lowest_price`

Get the lowest price for a specific product across all platforms.

```json
{
  "product_name": " Dyson V15 吸尘器"
}
```

## Platform Status

| Platform | Search | Affiliate | Status |
|----------|--------|-----------|--------|
| 淘宝/天猫 | ✅ | ✅ | Working |
| 京东 | ✅ | ✅ | Working |
| 拼多多 | ✅ | ❌ | Coming soon |
| 慢慢买 | ✅ | ❌ | Coming soon |

## Data Source

Price data powered by:
- [淘宝开放平台](https://open.taobao.com/)
- [京东联盟](https://union.jd.com/)
- 慢慢买价格数据库

## License

MIT
