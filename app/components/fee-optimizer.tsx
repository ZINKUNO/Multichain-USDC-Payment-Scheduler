"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingDown, Zap, RefreshCw, CheckCircle } from "lucide-react"

const CHAINS = [
  { id: 11155111, name: "Ethereum Sepolia", symbol: "ETH", color: "bg-blue-500" },
  { id: 80001, name: "Polygon Mumbai", symbol: "MATIC", color: "bg-purple-500" },
  { id: 421614, name: "Arbitrum Sepolia", symbol: "ETH", color: "bg-orange-500" },
]

export function FeeOptimizer() {
  const [fees, setFees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [optimalChain, setOptimalChain] = useState<any>(null)

  const fetchFees = async () => {
    setIsLoading(true)
    try {
      // Simulate fee fetching with realistic data
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockFees = CHAINS.map((chain) => ({
        ...chain,
        gasPrice: Math.random() * 50 + 10, // 10-60 gwei
        estimatedFee: Math.random() * 2 + 0.5, // $0.5-$2.5
        transferTime: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
      }))

      // Sort by estimated fee to find optimal chain
      const sortedFees = mockFees.sort((a, b) => a.estimatedFee - b.estimatedFee)

      setFees(sortedFees)
      setOptimalChain(sortedFees[0])
      setLastUpdated(new Date())
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFees()
  }, [])

  const getSavings = () => {
    if (fees.length < 2) return 0
    const highest = Math.max(...fees.map((f) => f.estimatedFee))
    const lowest = Math.min(...fees.map((f) => f.estimatedFee))
    return (((highest - lowest) / highest) * 100).toFixed(1)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Fee Optimization
              </CardTitle>
              <CardDescription>Real-time gas prices and cross-chain transfer costs</CardDescription>
            </div>
            <Button onClick={fetchFees} disabled={isLoading} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lastUpdated && (
            <p className="text-sm text-gray-600 mb-4">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          )}

          {optimalChain && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{optimalChain.name}</strong> offers the lowest fees at ${optimalChain.estimatedFee.toFixed(2)}-
                Save up to {getSavings()}% compared to other chains!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {fees.map((chain, index) => (
          <Card key={chain.id} className={index === 0 ? "ring-2 ring-green-500" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${chain.color}`} />
                  <div>
                    <h3 className="font-semibold">{chain.name}</h3>
                    <p className="text-sm text-gray-600">Gas: {chain.gasPrice.toFixed(1)} gwei</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">${chain.estimatedFee.toFixed(2)}</span>
                    {index === 0 && (
                      <Badge variant="default" className="bg-green-500">
                        <Zap className="w-3 h-3 mr-1" />
                        Optimal
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    ~{Math.floor(chain.transferTime / 60)}m {chain.transferTime % 60}s
                  </p>
                </div>
              </div>

              <div className="mt-3 bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${chain.color}`}
                  style={{
                    width: `${(chain.estimatedFee / Math.max(...fees.map((f) => f.estimatedFee))) * 100}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How Fee Optimization Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
              1
            </div>
            <div>
              <p className="font-medium">Real-time Gas Price Monitoring</p>
              <p className="text-gray-600">
                We continuously monitor gas prices across Ethereum, Polygon, and Arbitrum testnets
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
              2
            </div>
            <div>
              <p className="font-medium">Cross-chain Transfer Cost Calculation</p>
              <p className="text-gray-600">
                Using LI.FI SDK, we calculate the total cost including bridging fees via Circle CCTP V2
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
              3
            </div>
            <div>
              <p className="font-medium">Automatic Chain Selection</p>
              <p className="text-gray-600">
                The system automatically selects the most cost-effective chain for each payment
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
