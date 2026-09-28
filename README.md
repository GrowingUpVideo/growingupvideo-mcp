# GrowingUpVideo MCP server

Remote MCP server for [GrowingUpVideo](https://growingupvideo.com), which turns photos of a person, couple, or pet across the years into an AI growing-up morph video.

It lets an AI assistant explain the product, give photo tips, and hand the user a link to make their video. The user uploads photos, crops, orders, and pays on the website. The server creates no job, stores nothing, and needs no auth.

## Connect

| | |
|---|---|
| URL | `https://growingupvideo.com/mcp` |
| Transport | Streamable HTTP (stateless, POST only) |
| Auth | None |

Claude: Settings → Connectors → Add custom connector → paste the URL.
Other clients: add it as a remote (streamable HTTP) MCP server.

## Tools

All three take no input and are read-only.

| Tool | Returns |
|---|---|
| `get_offer` | What the video is, how it works, prices, redos, privacy |
| `photo_tips` | How to pick photos (count, ages, framing, quality) |
| `start_video` | The link where the user makes their video |

## Source

This is the source of the hosted server, which runs inside the growingupvideo.com Nuxt app (Nitro routes, `@modelcontextprotocol/sdk`). It is published for transparency and is not a standalone package.

- `server/utils/mcp.ts`: server, tools, and texts
- `server/routes/mcp/`: the two endpoints (`/mcp` for general clients, `/mcp/muse` for Meta Muse)
- `shared/pricing.ts`: prices, shared with the website
- `server.json`: the [MCP Registry](https://registry.modelcontextprotocol.io) entry (`com.growingupvideo/growingupvideo`)

## Links

- Website: https://growingupvideo.com
- How it works: https://growingupvideo.com/how-it-works/
- Contact: info@growingupvideo.com

## License

MIT
