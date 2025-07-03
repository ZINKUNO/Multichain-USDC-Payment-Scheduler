import { NextResponse } from "next/server"

// Server-side LI.FI integration with API key
const LIFI_API_KEY = process.env.LIFI_API_KEY
const LIFI_BASE_URL = "https://li.quest/v1"

async function makeLiFiRequest(endpoint: string) {
  const response = await fetch(`${LIFI_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(LIFI_API_KEY && { "x-lifi-api-key": LIFI_API_KEY }),
      "x-lifi-integrator": process.env.LIFI_INTEGRATOR_ID || "usdc-payment-scheduler",
    },
  })

  if (!response.ok) {
    throw new Error(`LI.FI API error: ${response.status}`)
  }

  return response.json()
}

export async function GET() {
  try {
    const startTime = Date.now()

    // Make parallel requests to get chains and tools
    const [chainsData, toolsData] = await Promise.all([
      makeLiFiRequest("/chains").catch(() => ({ chains: [] })),
      makeLiFiRequest("/tools").catch(() => ({ tools: [] })),
    ])

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      isConnected: true,
      responseTime,
      supportedChains: chainsData.chains?.length || 0,
      supportedTools: toolsData.tools?.length || 0,
      lastChecked: new Date().toISOString(),
    })
  } catch (error) {
    console.error("LiFi status check failed:", error)

    return NextResponse.json({
      isConnected: false,
      responseTime: 0,
      supportedChains: 0,
      supportedTools: 0,
      lastChecked: new Date().toISOString(),
    })
  }
}
