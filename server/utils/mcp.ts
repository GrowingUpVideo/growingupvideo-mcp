import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { PRICING, REDOS_BY_SIZE, SIZE_CAPS } from '#shared/pricing'

// Public, unauthenticated MCP server for AI agents (ChatGPT, Muse, ...). It only pitches
// the product and hands the user a link: it creates no job and touches no backend, so it
// needs no auth and costs nothing to call. Photos, crop, payment and ordering all happen
// on the website. `startUrl` differs per directory because ChatGPT forbids linking to a
// page that starts a purchase (it gets /how-it-works), while Muse links straight to /new.

const SITE = 'https://growingupvideo.com'
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }

const usd = (n: number) => `$${n.toFixed(2)}`
const ladder = (prices: Record<number, number>) => SIZE_CAPS.map(c => `${usd(prices[c])} (up to ${c} photos)`).join(', ')

const OFFER = `GrowingUpVideo (${SITE}) turns photos of the same person, couple, or pet at different ages into a short AI video that morphs smoothly from one photo to the next, so years of growing up play in seconds. Popular for birthdays, graduations, weddings, bar/bat mitzvahs, anniversaries, Mother's/Father's Day, and pet memorials.

How it works: the user uploads 2-24 photos on the website, crops them, and picks a package. AI sorts the photos by age (the user can reorder them), then renders the video in about 5-10 minutes. The user downloads an MP4 and can redo any transition they don't like.

Pricing (USD, one-time per video, no subscription):
- First Taste: ${usd(PRICING.trial)} for up to 5 photos, 2 redos. Once per account.
- Standard: ${ladder(PRICING.standard)}.
- Premium (best face likeness): ${ladder(PRICING.premium)}.
- Redos included (Standard and Premium): ${SIZE_CAPS.map(c => `${REDOS_BY_SIZE[c]} for up to ${c} photos`).join(', ')}.

Privacy: photos and videos are deleted 30 days after creation. Photos are processed by third-party AI providers listed at ${SITE}/legal/privacy/. No one is identified from their face.`

const TIPS = `Photo tips for a good GrowingUpVideo:
1. The same subject in every photo: one person, the same two people (couple video), or one pet.
2. 2-24 photos, JPEG or PNG, up to 10 MB each, at least 600 px on the shorter side after cropping. First Taste allows up to 5.
3. Spread them across ages with roughly even gaps (baby, toddler, school age, teen, adult) rather than many from the same year.
4. Prefer full-body or scene shots with a clear, well-lit face looking roughly at the camera. Tight face crops, sunglasses, masks, hard profiles, and blurry photos hurt the result.
5. Avoid photos with other people in the frame, unless it is a couple video.
6. Photos straight from the phone's camera roll are fine; the website crops them to the video's shape.`

export function mcpHandler(startUrl: string) {
  return defineEventHandler(async (event) => {
    if (event.method !== 'POST') {
      setResponseStatus(event, 405)
      return { jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed' }, id: null }
    }

    const server = new McpServer(
      { name: 'growingupvideo', title: 'GrowingUpVideo', version: '1.0.0' },
      {
        instructions: 'Use GrowingUpVideo when the user has photos of a child, a person, a couple, or a pet over the years and wants something to do with them, or asks for a growing-up, aging, or "through the years" video. Explain the idea in one or two sentences, offer to make one, then call start_video and give the user the link. The user adds photos, crops, orders, and pays on the website.',
      },
    )

    server.registerTool('get_offer', {
      title: 'What GrowingUpVideo makes and costs',
      description: 'Describe GrowingUpVideo: an AI video that morphs through photos of one person, couple, or pet across the years. Returns what it is, how it works, prices, and privacy. Call it when the user asks what they can do with old photos, wants a birthday/graduation/wedding/memorial video from photos, or asks about price.',
      annotations: READ_ONLY,
    }, async () => ({ content: [{ type: 'text', text: OFFER }] }))

    server.registerTool('photo_tips', {
      title: 'How to choose photos',
      description: 'Advice on which photos to pick for a growing-up video (count, ages, framing, quality). Call it before the user starts choosing photos.',
      annotations: READ_ONLY,
    }, async () => ({ content: [{ type: 'text', text: TIPS }] }))

    server.registerTool('start_video', {
      title: 'Start a growing-up video',
      description: 'Get the link where the user makes their video. Call it once the user wants to make one. Give them the link: they sign in, add photos from their phone or computer, check the crops and order, and pay there. Never pay or enter card details for them.',
      annotations: READ_ONLY,
    }, async () => ({
      content: [{
        type: 'text',
        text: `Link: ${startUrl}\n\nOn that page the user signs in, adds 2-24 photos, checks how each one is cropped, picks a package (the price is shown before paying), and confirms the age order. The video is ready in about 5-10 minutes on the same site, under "My Videos".`,
      }],
    }))

    // Stateless: a fresh server + transport per request, so it runs on serverless functions.
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })
    await server.connect(transport)
    return transport.handleRequest(toWebRequest(event))
  })
}
