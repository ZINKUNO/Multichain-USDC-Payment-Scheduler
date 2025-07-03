import { lifiService, type GasPriceData } from "./lifi-integration"

export interface FeeOptimization {
  recommendedChain: number
  recommendedChainName: string
  estimatedSavings: number
  estimatedSavingsUsd: number
  allChainCosts: GasPriceData[]
  lastUpdated: Date
}

export class FeeOptimizer {
  private cache: Map<string, { data: FeeOptimization; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 30000 // 30 seconds

  async getOptimizedFees(amount = "1000000"): Promise<FeeOptimization> {
    const cacheKey = `fees-${amount}`
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const gasPrices = await lifiService.getGasPrices()

      if (gasPrices.length === 0) {
        throw new Error("No gas price data available")
      }

      // Find the cheapest option
      const cheapest = gasPrices.reduce((min, current) => (current.gasPriceUsd < min.gasPriceUsd ? current : min))

      // Calculate savings compared to most expensive
      const mostExpensive = gasPrices.reduce((max, current) => (current.gasPriceUsd > max.gasPriceUsd ? current : max))

      const savings = mostExpensive.gasPriceUsd - cheapest.gasPriceUsd
      const savingsPercentage = mostExpensive.gasPriceUsd > 0 ? (savings / mostExpensive.gasPriceUsd) * 100 : 0

      const optimization: FeeOptimization = {
        recommendedChain: cheapest.chainId,
        recommendedChainName: cheapest.chainName,
        estimatedSavings: savingsPercentage,
        estimatedSavingsUsd: savings,
        allChainCosts: gasPrices,
        lastUpdated: new Date(),
      }

      // Cache the result
      this.cache.set(cacheKey, { data: optimization, timestamp: Date.now() })

      return optimization
    } catch (error) {
      console.error("Fee optimization failed:", error)

      // Return fallback data
      return {
        recommendedChain: 42161, // Arbitrum as fallback
        recommendedChainName: "Arbitrum",
        estimatedSavings: 85,
        estimatedSavingsUsd: 12.5,
        allChainCosts: [],
        lastUpdated: new Date(),
      }
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const feeOptimizer = new FeeOptimizer()
