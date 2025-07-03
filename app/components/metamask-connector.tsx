"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, ExternalLink, Copy, CheckCircle, AlertCircle, Network } from "lucide-react"
import { useWallet } from "@/app/hooks/use-wallet"

const SUPPORTED_NETWORKS = [
  { chainId: 1, name: "Ethereum", symbol: "ETH", color: "bg-blue-500" },
  { chainId: 137, name: "Polygon", symbol: "MATIC", color: "bg-purple-500" },
  { chainId: 42161, name: "Arbitrum", symbol: "ETH", color: "bg-orange-500" },
  { chainId: 10, name: "Optimism", symbol: "ETH", color: "bg-red-500" },
  { chainId: 56, name: "BSC", symbol: "BNB", color: "bg-yellow-500" },
  { chainId: 43114, name: "Avalanche", symbol: "AVAX", color: "bg-green-500" },
]

export function MetaMaskConnector() {
  const { isConnected, account, chainId, balance, connectWallet, disconnectWallet, switchChain } = useWallet()

  const [copied, setCopied] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connectWallet()
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const currentNetwork = SUPPORTED_NETWORKS.find((network) => network.chainId === chainId)
  const isUnsupportedNetwork = isConnected && !currentNetwork

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Connection
        </CardTitle>
        <CardDescription className="text-gray-400">
          Connect your MetaMask wallet to start using the payment scheduler
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {!isConnected ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
              <Wallet className="h-8 w-8 text-orange-400" />
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">Connect Your Wallet</h3>
              <p className="text-gray-400 text-sm mb-4">
                Connect with MetaMask to access all payment scheduling features
              </p>
            </div>

            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect MetaMask
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500">
              Don't have MetaMask?{" "}
              <a
                href="https://metamask.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:underline"
              >
                Install it here
              </a>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-green-300 font-medium">Wallet Connected</span>
              </div>
              <Button
                onClick={disconnectWallet}
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
              >
                Disconnect
              </Button>
            </div>

            {/* Account Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Account</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono text-sm">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                  <Button
                    onClick={copyAddress}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    {copied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                  <Button
                    onClick={() => window.open(`https://etherscan.io/address/${account}`, "_blank")}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Balance</span>
                <span className="text-white font-medium">
                  {balance
                    ? `${Number.parseFloat(balance).toFixed(4)} ${currentNetwork?.symbol || "ETH"}`
                    : "Loading..."}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Network</span>
                <div className="flex items-center gap-2">
                  {currentNetwork ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <div className={`w-2 h-2 rounded-full ${currentNetwork.color} mr-1`} />
                      {currentNetwork.name}
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Unsupported Network</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Network Warning */}
            {isUnsupportedNetwork && (
              <Alert className="border-yellow-500/50 bg-yellow-500/10">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-300">
                  You're connected to an unsupported network. Please switch to one of the supported networks below.
                </AlertDescription>
              </Alert>
            )}

            {/* Supported Networks */}
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Network className="h-4 w-4" />
                Supported Networks
              </h4>

              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_NETWORKS.map((network) => (
                  <Button
                    key={network.chainId}
                    onClick={() => switchChain(network.chainId)}
                    variant="outline"
                    size="sm"
                    className={`justify-start border-gray-700 hover:bg-gray-700 bg-transparent ${
                      chainId === network.chainId
                        ? "border-green-500/50 bg-green-500/10 text-green-400"
                        : "text-gray-300"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${network.color} mr-2`} />
                    {network.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
