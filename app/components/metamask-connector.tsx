"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, CheckCircle, AlertCircle, RefreshCw, ExternalLink } from "lucide-react"

interface WalletState {
  isConnected: boolean
  address: string | null
  chainId: number | null
  balance: string | null
  isCorrectNetwork: boolean
}

const SUPPORTED_NETWORKS = {
  1: { name: "Ethereum", symbol: "ETH", color: "bg-blue-500" },
  137: { name: "Polygon", symbol: "MATIC", color: "bg-purple-500" },
  42161: { name: "Arbitrum", symbol: "ARB", color: "bg-cyan-500" },
  10: { name: "Optimism", symbol: "OP", color: "bg-red-500" },
}

export function MetaMaskConnector() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null,
    isCorrectNetwork: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        const chainId = await window.ethereum.request({ method: "eth_chainId" })

        if (accounts.length > 0) {
          const balance = await window.ethereum.request({
            method: "eth_getBalance",
            params: [accounts[0], "latest"],
          })

          const balanceInEth = (Number.parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4)
          const numericChainId = Number.parseInt(chainId, 16)

          setWalletState({
            isConnected: true,
            address: accounts[0],
            chainId: numericChainId,
            balance: balanceInEth,
            isCorrectNetwork: Object.keys(SUPPORTED_NETWORKS).includes(numericChainId.toString()),
          })
        }
      } catch (err) {
        console.error("Error checking wallet connection:", err)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed. Please install MetaMask to continue.")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        await checkWalletConnection()
      }
    } catch (err: any) {
      if (err.code === 4001) {
        setError("Connection rejected by user")
      } else {
        setError("Failed to connect wallet")
      }
    } finally {
      setLoading(false)
    }
  }

  const switchNetwork = async (chainId: number) => {
    if (typeof window.ethereum === "undefined") return

    try {
      setLoading(true)
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
    } catch (err: any) {
      if (err.code === 4902) {
        // Network not added to MetaMask
        setError("Network not added to MetaMask. Please add it manually.")
      } else {
        setError("Failed to switch network")
      }
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      chainId: null,
      balance: null,
      isCorrectNetwork: false,
    })
  }

  useEffect(() => {
    checkWalletConnection()

    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", checkWalletConnection)
      window.ethereum.on("chainChanged", checkWalletConnection)

      return () => {
        window.ethereum.removeListener("accountsChanged", checkWalletConnection)
        window.ethereum.removeListener("chainChanged", checkWalletConnection)
      }
    }
  }, [])

  const currentNetwork = walletState.chainId
    ? SUPPORTED_NETWORKS[walletState.chainId as keyof typeof SUPPORTED_NETWORKS]
    : null

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-orange-400" />
          MetaMask Wallet
        </CardTitle>
        <CardDescription className="text-gray-400">
          Connect your wallet to start using the payment scheduler
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-500/50 bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {!walletState.isConnected ? (
          <div className="text-center space-y-4">
            <div className="p-8 rounded-lg bg-gray-800/50 border border-gray-700">
              <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">Connect Your Wallet</h3>
              <p className="text-gray-400 text-sm mb-4">
                Connect your MetaMask wallet to schedule and execute USDC payments
              </p>
              <Button
                onClick={connectWallet}
                disabled={loading}
                className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Connect MetaMask
                  </div>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Wallet Info */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">Wallet Connected</span>
                </div>
                <Button variant="ghost" size="sm" onClick={disconnectWallet} className="text-gray-400 hover:text-white">
                  Disconnect
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Address:</span>
                  <span className="text-white font-mono text-sm">
                    {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Balance:</span>
                  <span className="text-white">{walletState.balance} ETH</span>
                </div>
              </div>
            </div>

            {/* Network Status */}
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-300">Current Network</span>
                {walletState.isCorrectNetwork ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Supported
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Switch Required
                  </Badge>
                )}
              </div>

              {currentNetwork && (
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-3 h-3 rounded-full ${currentNetwork.color}`} />
                  <span className="text-white">{currentNetwork.name}</span>
                </div>
              )}

              {!walletState.isCorrectNetwork && (
                <Alert className="border-yellow-500/50 bg-yellow-500/10 mb-3">
                  <AlertDescription className="text-yellow-400 text-sm">
                    Please switch to a supported network to use all features
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Supported Networks */}
            <div className="space-y-2">
              <h4 className="text-gray-300 font-medium">Supported Networks</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(SUPPORTED_NETWORKS).map(([chainId, network]) => (
                  <Button
                    key={chainId}
                    variant="outline"
                    size="sm"
                    onClick={() => switchNetwork(Number.parseInt(chainId))}
                    disabled={loading || walletState.chainId === Number.parseInt(chainId)}
                    className={`justify-start border-gray-700 text-gray-300 hover:bg-gray-800 ${
                      walletState.chainId === Number.parseInt(chainId) ? "bg-gray-800 border-gray-600" : ""
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${network.color} mr-2`} />
                    {network.name}
                    {walletState.chainId === Number.parseInt(chainId) && (
                      <CheckCircle className="w-3 h-3 ml-auto text-green-400" />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://etherscan.io/address/${walletState.address}`, "_blank")}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View on Explorer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={checkWalletConnection}
                disabled={loading}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
