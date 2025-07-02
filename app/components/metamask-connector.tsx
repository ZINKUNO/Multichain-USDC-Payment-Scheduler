"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, CheckCircle, AlertCircle } from "lucide-react"
import { useWallet } from "../hooks/use-wallet"

const SUPPORTED_CHAINS = {
  11155111: { name: "Ethereum Sepolia", symbol: "ETH" },
  80001: { name: "Polygon Mumbai", symbol: "MATIC" },
  421614: { name: "Arbitrum Sepolia", symbol: "ETH" },
}

export function MetaMaskConnector() {
  const { isConnected, account, chainId, balance, connectWallet, switchChain, error } = useWallet()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connectWallet()
    } finally {
      setIsConnecting(false)
    }
  }

  const currentChain = chainId ? SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS] : null
  const isSupported = chainId && Object.keys(SUPPORTED_CHAINS).includes(chainId.toString())

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <Wallet className="w-8 h-8 text-blue-600" />
          <div>
            <h3 className="font-semibold">Connect MetaMask</h3>
            <p className="text-sm text-gray-600">Connect your wallet to get started</p>
          </div>
        </div>
        <Button onClick={handleConnect} disabled={isConnecting} className="w-full max-w-xs">
          {isConnecting ? "Connecting..." : "Connect MetaMask"}
        </Button>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-semibold">Wallet Connected</h3>
            <p className="text-sm text-gray-600">
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{balance} ETH</p>
          <Badge variant={isSupported ? "default" : "destructive"}>{currentChain?.name || `Chain ${chainId}`}</Badge>
        </div>
      </div>

      {!isSupported && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please switch to a supported testnet: Ethereum Sepolia, Polygon Mumbai, or Arbitrum Sepolia
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2 flex-wrap">
        {Object.entries(SUPPORTED_CHAINS).map(([id, chain]) => (
          <Button
            key={id}
            variant={chainId?.toString() === id ? "default" : "outline"}
            size="sm"
            onClick={() => switchChain(Number.parseInt(id))}
          >
            {chain.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
