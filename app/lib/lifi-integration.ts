// Client-side LI.FI integration without sensitive API keys
export interface LiFiChain {
  id: number
  name: string
  key: string
  chainType: string
  nativeToken: {
    symbol: string
    decimals: number
  }
}

export interface LiFiToken {
  address: string
  symbol: string
  decimals: number
  chainId: number
  name: string
  logoURI?: string
}

export interface LiFiQuote {
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

export interface GasPriceData {
  chainId: number
  chainName: string
  gasPrice: string
  gasPriceUsd: number
  recommended: boolean
}

export interface LiFiStatus {
  isConnected: boolean
  responseTime: number
  supportedChains: number
  supportedTools: number
  lastChecked: Date
}

// Client-side service that calls server actions
export class LiFiService {
  async getStatus(): Promise<LiFiStatus> {
    try {
      const response = await fetch("/api/lifi/status")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return {
        ...data,
        lastChecked: new Date(data.lastChecked),
      }
    } catch (error) {
      console.error("Failed to get LiFi status:", error)
      return {
        isConnected: false,
        responseTime: 0,
        supportedChains: 0,
        supportedTools: 0,
        lastChecked: new Date(),
      }
    }
  }

  async getGasPrices(): Promise<GasPriceData[]> {
    try {
      const response = await fetch("/api/lifi/gas-prices")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Failed to get gas prices:", error)
      // Return fallback data
      return this.getFallbackGasPrices()
    }
  }

  async getQuote(params: {
    fromChain: number
    toChain: number
    fromToken: string
    toToken: string
    fromAmount: string
    fromAddress?: string
  }): Promise<LiFiQuote | null> {
    try {
      const response = await fetch("/api/lifi/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to get quote:", error)
      return null
    }
  }

  private getFallbackGasPrices(): GasPriceData[] {
    const chains = [
      { id: 1, name: "Ethereum", gasPrice: 25, usdPrice: 2400 },
      { id: 137, name: "Polygon", gasPrice: 30, usdPrice: 1.0 },
      { id: 42161, name: "Arbitrum", gasPrice: 0.1, usdPrice: 2400 },
      { id: 10, name: "Optimism", gasPrice: 0.001, usdPrice: 2400 },
      { id: 56, name: "BSC", gasPrice: 5, usdPrice: 300 },
      { id: 43114, name: "Avalanche", gasPrice: 25, usdPrice: 35 },
    ]

    return chains.map((chain) => ({
      chainId: chain.id,
      chainName: chain.name,
      gasPrice: chain.gasPrice.toString(),
      gasPriceUsd: chain.gasPrice * 0.000001 * chain.usdPrice,
      recommended: chain.gasPrice < 20,
    }))
  }
}

export const lifiService = new LiFiService()
