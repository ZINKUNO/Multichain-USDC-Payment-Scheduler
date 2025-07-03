import { lifiService } from "./lifi-integration"

export interface FeeData {
  chainId: number
  chainName: string
  gasPrice: string
  estimatedCost: string
  currency: string
  usdValue?: number
  recommendation: "low" | "medium" | "high"
}

export interface OptimizationResult {
  recommendedChain: number
  savings: string
  fees: FeeData[]
  timestamp: number
}

const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  137: "Polygon",
  42161: "Arbitrum One",
  10: "Optimism",
  56: "BNB Chain",
  43114: "Avalanche",
}

// Approximate USD values for gas tokens (would normally come from price API)
const TOKEN_USD_PRICES: Record<string, number> = {
  ETH: 2400,
  MATIC: 1.0,
  BNB: 300,
  AVAX: 35,
}

export async function fetchFeeData(chainIds: number[] = [1, 137, 42161]): Promise<FeeData[]> {
  try {
    const gasPrices = await lifiService.getGasPrices(chainIds)

    return gasPrices.map((gasData) => {
      const usdPrice = TOKEN_USD_PRICES[gasData.currency] || 1
      const costInUsd = Number.parseFloat(gasData.estimatedCost) * usdPrice

      let recommendation: "low" | "medium" | "high" = "medium"
      if (costInUsd < 1) recommendation = "low"
      else if (costInUsd > 10) recommendation = "high"

      return {
        chainId: gasData.chainId,
        chainName: CHAIN_NAMES[gasData.chainId] || `Chain ${gasData.chainId}`,
        gasPrice: gasData.gasPrice,
        estimatedCost: gasData.estimatedCost,
        currency: gasData.currency,
        usdValue: costInUsd,
        recommendation,
      }
    })
  } catch (error) {
    console.error("Failed to fetch fee data:", error)

    // Return fallback data
    return chainIds.map((chainId) => ({
      chainId,
      chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
      gasPrice: "20000000000",
      estimatedCost: "0.005",
      currency: chainId === 137 ? "MATIC" : "ETH",
      usdValue: chainId === 137 ? 0.005 : 12,
      recommendation: chainId === 137 ? "low" : chainId === 42161 ? "medium" : "high",
    }))
  }
}

export async function optimizeFees(chainIds: number[]): Promise<OptimizationResult> {
  const fees = await fetchFeeData(chainIds)

  // Find the chain with lowest USD cost
  const sortedByUsd = fees.sort((a, b) => (a.usdValue || 0) - (b.usdValue || 0))
  const cheapest = sortedByUsd[0]
  const mostExpensive = sortedByUsd[sortedByUsd.length - 1]

  const savings =
    mostExpensive.usdValue && cheapest.usdValue ? (mostExpensive.usdValue - cheapest.usdValue).toFixed(2) : "0"

  return {
    recommendedChain: cheapest.chainId,
    savings: `$${savings}`,
    fees: fees.sort((a, b) => a.chainId - b.chainId),
    timestamp: Date.now(),
  }
}

export function formatGasPrice(gasPrice: string, decimals = 9): string {
  const price = Number.parseFloat(gasPrice) / Math.pow(10, decimals)
  return price.toFixed(2)
}

export function formatCurrency(amount: string, currency: string): string {
  const value = Number.parseFloat(amount)
  if (value < 0.001) {
    return `${(value * 1000).toFixed(2)}m ${currency}`
  }
  return `${value.toFixed(4)} ${currency}`
}
