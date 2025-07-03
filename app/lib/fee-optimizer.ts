// Fee Optimization Service using LI.FI SDK and Etherscan Gas Tracker
// Import the LI.FI service
import { lifiService } from "./lifi-integration"

export interface ChainFeeData {
  chainId: number
  name: string
  symbol: string
  color: string
  gasPrice: number
  estimatedFee: number
  transferTime: number
  savings?: number
}

export interface FeeOptimizationResult {
  optimalChain: ChainFeeData
  allChains: ChainFeeData[]
  totalSavings: number
}

const ETHERSCAN_API_KEY = "VDU62CK7PS35WC66A8ZD2SRC1S6JXY5NIQ"

const SUPPORTED_CHAINS = [
  { chainId: 11155111, name: "Ethereum Sepolia", symbol: "ETH", color: "bg-blue-500" },
  { chainId: 80001, name: "Polygon Mumbai", symbol: "MATIC", color: "bg-purple-500" },
  { chainId: 421614, name: "Arbitrum Sepolia", symbol: "ETH", color: "bg-orange-500" },
]

const USDC_ADDRESSES = {
  11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia
  80001: "0x0FA8781a83E468F3b7C25308B9421c0c1bE7a6B0", // Mumbai
  421614: "0x75faf114eafb1BDbe6fc3363c7f609b9d5a8f3dA", // Arbitrum Sepolia
}

// Update the FeeOptimizer class constructor
export class FeeOptimizer {
  private lifiApiKey: string
  private integratorId: string

  constructor(
    lifiApiKey = "77ad3ad2-7cc8-47b5-bf30-01dde38aa7ce.a5aed5a5-a4c3-4d58-ad87-031f5bfe4b17",
    integratorId = "usdc-payment-scheduler",
  ) {
    this.lifiApiKey = lifiApiKey
    this.integratorId = integratorId
  }

  async optimizeFees(amount = "100", fromAddress?: string, toAddress?: string): Promise<FeeOptimizationResult> {
    const chainFees: ChainFeeData[] = []

    for (const chain of SUPPORTED_CHAINS) {
      try {
        const feeData = await this.getChainFeeData(chain, amount, fromAddress, toAddress)
        chainFees.push(feeData)
      } catch (error) {
        console.error(`Error getting fee data for ${chain.name}:`, error)
        // Add fallback data
        chainFees.push({
          ...chain,
          gasPrice: Math.random() * 50 + 10,
          estimatedFee: Math.random() * 2 + 0.5,
          transferTime: Math.floor(Math.random() * 300) + 30,
        })
      }
    }

    // Sort by estimated fee (lowest first)
    const sortedChains = chainFees.sort((a, b) => a.estimatedFee - b.estimatedFee)

    // Calculate savings for each chain
    const highestFee = Math.max(...sortedChains.map((c) => c.estimatedFee))
    const chainsWithSavings = sortedChains.map((chain) => ({
      ...chain,
      savings: ((highestFee - chain.estimatedFee) / highestFee) * 100,
    }))

    const optimalChain = chainsWithSavings[0]
    const totalSavings = optimalChain.savings || 0

    return {
      optimalChain,
      allChains: chainsWithSavings,
      totalSavings,
    }
  }

  private async getChainFeeData(
    chain: (typeof SUPPORTED_CHAINS)[0],
    amount: string,
    fromAddress?: string,
    toAddress?: string,
  ): Promise<ChainFeeData> {
    let gasPrice = 20 // Default fallback
    let estimatedFee = 1.0 // Default fallback

    try {
      // Try LI.FI SDK first (if available)
      if (fromAddress && toAddress) {
        const lifiQuote = await this.getLiFiQuote(chain.chainId, amount, fromAddress, toAddress)
        if (lifiQuote) {
          return {
            ...chain,
            gasPrice: lifiQuote.gasPrice,
            estimatedFee: lifiQuote.estimatedFee,
            transferTime: lifiQuote.transferTime,
          }
        }
      }

      // Fallback to chain-specific APIs
      if (chain.chainId === 11155111) {
        // Ethereum Sepolia - use Etherscan Gas Tracker
        const etherscanData = await this.getEtherscanGasPrice()
        if (etherscanData) {
          gasPrice = etherscanData.gasPrice
          estimatedFee = etherscanData.estimatedFee
        }
      } else {
        // For other chains, simulate realistic values
        gasPrice = this.getSimulatedGasPrice(chain.chainId)
        estimatedFee = this.getSimulatedFee(chain.chainId)
      }
    } catch (error) {
      console.error(`Error fetching data for ${chain.name}:`, error)
      // Use fallback values
      gasPrice = this.getSimulatedGasPrice(chain.chainId)
      estimatedFee = this.getSimulatedFee(chain.chainId)
    }

    return {
      ...chain,
      gasPrice,
      estimatedFee,
      transferTime: this.getSimulatedTransferTime(chain.chainId),
    }
  }

  // Update the getLiFiQuote method to use real API
  private async getLiFiQuote(
    chainId: number,
    amount: string,
    fromAddress?: string,
    toAddress?: string,
  ): Promise<{ gasPrice: number; estimatedFee: number; transferTime: number } | null> {
    try {
      // For same-chain transfers, get gas prices
      const gasData = await lifiService.getGasPrices(chainId)
      if (gasData) {
        return {
          gasPrice: Number.parseFloat(gasData.gasPrice),
          estimatedFee: gasData.estimatedFee,
          transferTime: this.getEstimatedTransferTime(chainId),
        }
      }

      // For cross-chain transfers, get quotes between chains
      if (fromAddress && toAddress) {
        const usdcAddress = USDC_ADDRESSES[chainId as keyof typeof USDC_ADDRESSES]
        if (usdcAddress) {
          // Convert amount to wei (USDC has 6 decimals)
          const amountWei = (Number.parseFloat(amount) * 1e6).toString()

          const quote = await lifiService.getQuote(
            chainId,
            chainId, // Same chain for now
            usdcAddress,
            usdcAddress,
            amountWei,
            fromAddress,
          )

          if (quote?.estimate) {
            const gasCost = quote.estimate.gasCosts[0]
            const gasAmount = Number.parseFloat(gasCost.amount) / Math.pow(10, gasCost.token.decimals)

            return {
              gasPrice: gasAmount,
              estimatedFee: gasAmount * 2000, // Rough USD conversion
              transferTime: quote.estimate.executionDuration || this.getEstimatedTransferTime(chainId),
            }
          }
        }
      }

      return null
    } catch (error) {
      console.error("LI.FI quote failed:", error)
      return null
    }
  }

  // Add helper method for transfer time estimation
  private getEstimatedTransferTime(chainId: number): number {
    switch (chainId) {
      case 80001: // Mumbai
        return 30 + Math.random() * 60 // 30-90 seconds
      case 421614: // Arbitrum Sepolia
        return 60 + Math.random() * 120 // 60-180 seconds
      default: // Ethereum Sepolia
        return 180 + Math.random() * 300 // 180-480 seconds
    }
  }

  private async getEtherscanGasPrice(): Promise<{ gasPrice: number; estimatedFee: number } | null> {
    try {
      const response = await fetch(
        `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY}`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status !== "1") {
        throw new Error(`Etherscan API error: ${data.message}`)
      }

      const gasPrice = Number.parseFloat(data.result.ProposeGasPrice)

      // Calculate estimated fee: gasPrice (gwei) * gasLimit * ETH price
      const gasLimit = 21000 // Standard transfer
      const txCost = (gasPrice * 1e9 * gasLimit) / 1e18 // Convert to ETH
      const ethPrice = 2000 // Mock ETH price for demo
      const estimatedFee = txCost * ethPrice

      return {
        gasPrice,
        estimatedFee,
      }
    } catch (error) {
      console.error("Etherscan gas price fetch failed:", error)
      return null
    }
  }

  private getSimulatedGasPrice(chainId: number): number {
    switch (chainId) {
      case 80001: // Mumbai
        return Math.random() * 20 + 5 // 5-25 gwei
      case 421614: // Arbitrum Sepolia
        return Math.random() * 10 + 8 // 8-18 gwei
      default:
        return Math.random() * 50 + 10 // 10-60 gwei
    }
  }

  private getSimulatedFee(chainId: number): number {
    switch (chainId) {
      case 80001: // Mumbai - cheapest
        return 0.01 + Math.random() * 0.1
      case 421614: // Arbitrum Sepolia - medium
        return 0.05 + Math.random() * 0.2
      default: // Ethereum Sepolia - most expensive
        return 0.5 + Math.random() * 1.5
    }
  }

  private getSimulatedTransferTime(chainId: number): number {
    switch (chainId) {
      case 80001: // Mumbai
        return Math.floor(Math.random() * 60) + 30 // 30-90 seconds
      case 421614: // Arbitrum Sepolia
        return Math.floor(Math.random() * 120) + 60 // 60-180 seconds
      default: // Ethereum Sepolia
        return Math.floor(Math.random() * 300) + 180 // 180-480 seconds
    }
  }
}

// Export singleton instance
export const feeOptimizer = new FeeOptimizer()
