// LI.FI SDK Integration for real cross-chain fee optimization
export interface LiFiQuote {
  estimate: {
    fromAmount: string
    toAmount: string
    gasCosts: Array<{
      amount: string
      token: {
        symbol: string
        decimals: number
      }
    }>
    executionDuration: number
  }
  transactionRequest?: {
    gasLimit: string
    gasPrice: string
  }
}

export interface LiFiChainData {
  chainId: number
  name: string
  nativeToken: {
    symbol: string
    decimals: number
  }
}

const LIFI_API_KEY = "77ad3ad2-7cc8-47b5-bf30-01dde38aa7ce.a5aed5a5-a4c3-4d58-ad87-031f5bfe4b17"
const LIFI_BASE_URL = "https://li.quest/v1"

export class LiFiService {
  private apiKey: string
  private integratorId: string

  constructor(apiKey = LIFI_API_KEY, integratorId = "usdc-payment-scheduler") {
    this.apiKey = apiKey
    this.integratorId = integratorId
  }

  /**
   * Get supported chains from LI.FI
   */
  async getSupportedChains(): Promise<LiFiChainData[]> {
    try {
      const response = await fetch(`${LIFI_BASE_URL}/chains`, {
        headers: {
          "x-lifi-api-key": this.apiKey,
          "x-lifi-integrator": this.integratorId,
        },
      })

      if (!response.ok) {
        throw new Error(`LI.FI API error: ${response.status}`)
      }

      const data = await response.json()
      return data.chains || []
    } catch (error) {
      console.error("Failed to fetch LI.FI chains:", error)
      return []
    }
  }

  /**
   * Get quote for cross-chain USDC transfer
   */
  async getQuote(
    fromChainId: number,
    toChainId: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    fromAddress?: string,
  ): Promise<LiFiQuote | null> {
    try {
      const params = new URLSearchParams({
        fromChain: fromChainId.toString(),
        toChain: toChainId.toString(),
        fromToken: fromTokenAddress,
        toToken: toTokenAddress,
        fromAmount: amount,
        integrator: this.integratorId,
      })

      if (fromAddress) {
        params.append("fromAddress", fromAddress)
      }

      const response = await fetch(`${LIFI_BASE_URL}/quote?${params}`, {
        headers: {
          "x-lifi-api-key": this.apiKey,
          "x-lifi-integrator": this.integratorId,
        },
      })

      if (!response.ok) {
        throw new Error(`LI.FI quote error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Failed to get LI.FI quote:", error)
      return null
    }
  }

  /**
   * Get gas prices for a specific chain
   */
  async getGasPrices(chainId: number): Promise<{ gasPrice: string; estimatedFee: number } | null> {
    try {
      const response = await fetch(`${LIFI_BASE_URL}/gas`, {
        headers: {
          "x-lifi-api-key": this.apiKey,
          "x-lifi-integrator": this.integratorId,
        },
      })

      if (!response.ok) {
        throw new Error(`LI.FI gas API error: ${response.status}`)
      }

      const data = await response.json()
      const chainData = data.result?.find((chain: any) => chain.chainId === chainId)

      if (chainData) {
        const gasPrice = chainData.gasPrice
        const estimatedFee = (Number.parseFloat(gasPrice) * 21000) / 1e18 // Estimate for simple transfer

        return {
          gasPrice: (Number.parseFloat(gasPrice) / 1e9).toString(), // Convert to gwei
          estimatedFee: estimatedFee * 2000, // Rough USD estimate
        }
      }

      return null
    } catch (error) {
      console.error("Failed to get LI.FI gas prices:", error)
      return null
    }
  }

  /**
   * Get tools (bridges/exchanges) available for a route
   */
  async getTools(): Promise<any[]> {
    try {
      const response = await fetch(`${LIFI_BASE_URL}/tools`, {
        headers: {
          "x-lifi-api-key": this.apiKey,
          "x-lifi-integrator": this.integratorId,
        },
      })

      if (!response.ok) {
        throw new Error(`LI.FI tools error: ${response.status}`)
      }

      const data = await response.json()
      return data.bridges || []
    } catch (error) {
      console.error("Failed to get LI.FI tools:", error)
      return []
    }
  }

  /**
   * Get token information
   */
  async getTokens(chainId?: number): Promise<any[]> {
    try {
      const params = chainId ? `?chains=${chainId}` : ""
      const response = await fetch(`${LIFI_BASE_URL}/tokens${params}`, {
        headers: {
          "x-lifi-api-key": this.apiKey,
          "x-lifi-integrator": this.integratorId,
        },
      })

      if (!response.ok) {
        throw new Error(`LI.FI tokens error: ${response.status}`)
      }

      const data = await response.json()
      return data.tokens || []
    } catch (error) {
      console.error("Failed to get LI.FI tokens:", error)
      return []
    }
  }
}

// Export singleton instance
export const lifiService = new LiFiService()
