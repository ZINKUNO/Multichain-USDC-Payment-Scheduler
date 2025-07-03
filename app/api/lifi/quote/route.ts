import { type NextRequest, NextResponse } from "next/server"

const LIFI_API_KEY = process.env.LIFI_API_KEY
const LIFI_BASE_URL = "https://li.quest/v1"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${LIFI_BASE_URL}/quote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(LIFI_API_KEY && { "x-lifi-api-key": LIFI_API_KEY }),
        "x-lifi-integrator": process.env.LIFI_INTEGRATOR_ID || "usdc-payment-scheduler",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`LI.FI API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to get LiFi quote:", error)
    return NextResponse.json({ error: "Failed to get quote" }, { status: 500 })
  }
}
