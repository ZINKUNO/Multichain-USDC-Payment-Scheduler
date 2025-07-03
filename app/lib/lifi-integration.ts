interface LiFiChain {
  id: number
  name: string
  key: string
  chainType: string
  nativeToken: {
    symbol: string
    decimals: number
  }
}

interface LiFiToken {
  address: string
  symbol: string
  decimals: number
  chainId: number
  name: string
  logoURI?: string
}

interface LiFiQuote {
  estimate: {
    fromAmount: string
    toAmount: string
    gasCosts: Array<{
      amount: string
      token: LiFiToken
    }>
  }
  transactionRequest?: {
    gasLimit: string
    gasPrice: string
  }
}

interface GasPriceData {
  chainId: number
  gasPrice: string
  estimatedCost: string
  currency: string
}

export class LiFiService {
  private baseUrl = "https://li.quest/v1"
  private apiKey: string
  private integratorId: string

  constructor() {
    this.apiKey = process.env.LIFI_API_KEY || ""
    this.integratorId = process.env.LIFI_INTEGRATOR_ID || "usdc-payment-scheduler"
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      "Content-Type": "application/json",
      ...(this.apiKey && { "x-lifi-api-key": this.apiKey }),
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new Error(`LI.FI API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`LI.FI API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  async getSupportedChains(): Promise<LiFiChain[]> {
    try {
      const data = await this.makeRequest("/chains")
      return data.chains || []
    } catch (error) {
      console.error("Failed to get LI.FI chains:", error)
      // Return fallback chains
      return [
        {
          id: 1,
          name: "Ethereum",
          key: "eth",
          chainType: "EVM",
          nativeToken: { symbol: "ETH", decimals: 18 },
        },
        {
          id: 137,
          name: "Polygon",
          key: "pol",
          chainType: "EVM",
          nativeToken: { symbol: "MATIC", decimals: 18 },
        },
        {
          id: 42161,
          name: "Arbitrum",
          key: "arb",
          chainType: "EVM",
          nativeToken: { symbol: "ETH", decimals: 18 },
        },
      ]
    }
  }

  async getQuote(
    fromChain: number,
    toChain: number,
    fromToken: string,
    toToken: string,
    fromAmount: string,
    fromAddress?: string,
  ): Promise<LiFiQuote | null> {
    try {
      const params = new URLSearchParams({
        fromChain: fromChain.toString(),
        toChain: toChain.toString(),
        fromToken,
        toToken,
        fromAmount,
        integrator: this.integratorId,
        ...(fromAddress && { fromAddress }),
      })

      const data = await this.makeRequest(`/quote?${params}`)
      return data
    } catch (error) {
      console.error("Failed to get LI.FI quote:", error)
      return null
    }
  }

  async getGasPrices(chainIds: number[] = [1, 137, 42161]): Promise<GasPriceData[]> {
    // Since the /gas endpoint doesn't exist, we'll use quotes to estimate gas costs
    const gasPrices: GasPriceData[] = []

    for (const chainId of chainIds) {
      try {
        // Use a small USDC amount to get gas estimates
        const quote = await this.getQuote(
          chainId,
          chainId === 1 ? 137 : 1, // Cross-chain for gas estimation
          "0xA0b86a33E6441E6C8C7C7b0b1b6C8C7b0b1b6C8C7", // USDC address placeholder
          "0xA0b86a33E6441E6C8C7C7b0b1b6C8C7b0b1b6C8C7",
          "1000000", // 1 USDC
        )

        if (quote?.estimate?.gasCosts?.[0]) {
          const gasCost = quote.estimate.gasCosts[0]
          gasPrices.push({
            chainId,
            gasPrice: quote.transactionRequest?.gasPrice || "20000000000",
            estimatedCost: gasCost.amount,
            currency: gasCost.token.symbol,
          })
        } else {
          // Fallback gas prices
          gasPrices.push({
            chainId,
            gasPrice: this.getFallbackGasPrice(chainId),
            estimatedCost: this.getFallbackGasCost(chainId),
            currency: this.getChainCurrency(chainId),
          })
        }
      } catch (error) {
        console.error(`Failed to get gas price for chain ${chainId}:`, error)
        gasPrices.push({
          chainId,
          gasPrice: this.getFallbackGasPrice(chainId),
          estimatedCost: this.getFallbackGasCost(chainId),
          currency: this.getChainCurrency(chainId),
        })
      }
    }

    return gasPrices
  }

  private getFallbackGasPrice(chainId: number): string {
    const fallbackPrices: Record<number, string> = {
      1: "25000000000", // 25 gwei for Ethereum
      137: "30000000000", // 30 gwei for Polygon
      42161: "100000000", // 0.1 gwei for Arbitrum
    }
    return fallbackPrices[chainId] || "20000000000"
  }

  private getFallbackGasCost(chainId: number): string {
    const fallbackCosts: Record<number, string> = {
      1: "0.005", // ~$12 at $2400 ETH
      137: "0.01", // ~$0.01 at $1 MATIC
      42161: "0.001", // ~$2.4 at $2400 ETH
    }
    return fallbackCosts[chainId] || "0.005"
  }

  private getChainCurrency(chainId: number): string {
    const currencies: Record<number, string> = {
      1: "ETH",
      137: "MATIC",
      42161: "ETH",
    }
    return currencies[chainId] || "ETH"
  }

  async getTokens(chainId: number): Promise<LiFiToken[]> {
    try {
      const data = await this.makeRequest(`/tokens?chains=${chainId}`)
      return data.tokens?.[chainId] || []
    } catch (error) {
      console.error("Failed to get LI.FI tokens:", error)
      return []
    }
  }

  async getTools(): Promise<any[]> {
    try {
      const data = await this.makeRequest("/tools")
      return data.tools || []
    } catch (error) {
      console.error("Failed to get LI.FI tools:", error)
      return []
    }
  }

  async getStatus(): Promise<{ isHealthy: boolean; chains: number; tools: number }> {
    try {
      const [chains, tools] = await Promise.all([this.getSupportedChains(), this.getTools()])

      return {
        isHealthy: true,
        chains: chains.length,
        tools: tools.length,
      }
    } catch (error) {
      return {
        isHealthy: false,
        chains: 0,
        tools: 0,
      }
    }
  }
}

export const lifiService = new LiFiService()
