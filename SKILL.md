# SKILL.md — mcp-pricepeek

## Identity

**Name**: pricepeek
**Type**: MCP server (Model Context Protocol)
**Description**: Real-time price comparison across Chinese e-commerce platforms for AI agents

## Trigger

AI agent encounters a product search, price lookup, or purchase intent:
- "帮我看看这个多少钱"
- "哪个平台最便宜"
- "iPhone 15 多少钱"
- User wants to compare prices before buying

## Capabilities

### 1. search_products
Search for a product across multiple platforms simultaneously.

**Input:**
```json
{
  "query": "商品名称",
  "platforms": ["taobao", "jd", "pinduoduo"],
  "limit": 10
}
```

**Output:** Array of product results sorted by price ascending.

### 2. get_lowest_price
Get the single lowest price across all platforms.

**Input:**
```json
{
  "product_name": "商品名称"
}
```

**Output:** Single lowest price result with platform and direct purchase link.

### 3. get_affiliate_link
Convert a product URL to an affiliate link (Taobao/JD only).

**Input:**
```json
{
  "product_url": "https://item.taobao.com/item.htm?id=xxx"
}
```

**Output:** Affiliate link with commission info.

## Data Sources

| Platform | API | Affiliate | Notes |
|----------|-----|-----------|-------|
| 淘宝/天猫 | 淘宝联盟 API | ✅ | Requires 阿里妈妈 affiliation |
| 京东 | 京东联盟 API | ✅ | Requires JD Union affiliation |
| 拼多多 | 多多进宝 API | ✅ | Requires pdd affiliation |
| 慢慢买 | 付费数据库 | ❌ | All-in-one price database |

## Configuration

Set via environment variables:
```bash
TAOBAO_APPKEY=your_appkey
TAOBAO_APPSECRET=your_secret
JD_APPKEY=your_jd_key
JD_SECRET=your_jd_secret
```

## Error Handling

- Platform API timeout: return partial results with `available: false` flag
- No results: return empty array with `suggestion` field
- Rate limited: exponential backoff, max 3 retries

## Response Format

All responses follow this envelope:
```json
{
  "success": true,
  "query": "iPhone 15",
  "results_count": 5,
  "data": [...]
}
```

Error:
```json
{
  "success": false,
  "error": "rate_limited",
  "retry_after": 5
}
```
