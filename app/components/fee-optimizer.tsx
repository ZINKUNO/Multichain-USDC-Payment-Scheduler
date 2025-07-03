"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, TrendingDown, TrendingUp, Zap, DollarSign } from "lucide-react"
import {
  fetchFeeData,
  optimizeFees,
  formatGasPrice,
  formatCurrency,
  type FeeData,
  type OptimizationResult,
} from "@/app/lib/fee-optimizer"

export function FeeOptimizer() {
  const [feeData, setFeeData] = useState<FeeData[]>([])
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadFeeData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [fees, optimizationResult] = await Promise.all([
        fetchFeeData([1, 137, 42161, 10]),
        optimizeFees([1, 137, 42161, 10]),
      ])

      setFeeData(fees)
      setOptimization(optimizationResult)
      setLastUpdated(new Date())
    } catch (err) {
      setError("Failed to load fee data. Please try again.")
      console.error("Fee optimization error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeeData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadFeeData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "low":
        return <TrendingDown className="w-3 h-3" />
      case "medium":
        return <Zap className="w-3 h-3" />
      case "high":
        return <TrendingUp className="w-3 h-3" />
      default:
        return null
    }
  }

  if (loading && feeData.length === 0) {
    return (
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-400" />
            Fee Optimizer
          </CardTitle>
          <CardDescription className="text-gray-400">Analyzing cross-chain gas fees...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-gray-700" />
                <Skeleton className="h-3 w-16 bg-gray-700" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-4 w-20 bg-gray-700" />
                <Skeleton className="h-3 w-12 bg-gray-700" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-400" />
              Fee Optimizer
            </CardTitle>
            <CardDescription className="text-gray-400">Compare gas fees across chains</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadFeeData}
            disabled={loading}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-500/50 bg-red-500/10">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {optimization && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Recommended Chain</h3>
                <p className="text-gray-400 text-sm">
                  {feeData.find((f) => f.chainId === optimization.recommendedChain)?.chainName}
                </p>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-medium">Save {optimization.savings}</div>
                <div className="text-gray-400 text-sm">vs most expensive</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {feeData.map((fee) => (
            <div
              key={fee.chainId}
              className={`p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
                optimization?.recommendedChain === fee.chainId
                  ? "bg-purple-500/10 border-purple-500/30"
                  : "bg-gray-800/50 border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium">{fee.chainName}</h4>
                    <Badge className={getRecommendationColor(fee.recommendation)}>
                      {getRecommendationIcon(fee.recommendation)}
                      {fee.recommendation}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm">{formatGasPrice(fee.gasPrice)} gwei</p>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-white font-medium">{formatCurrency(fee.estimatedCost, fee.currency)}</div>
                  {fee.usdValue && <div className="text-gray-400 text-sm">≈ ${fee.usdValue.toFixed(2)}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {lastUpdated && (
          <div className="text-center text-gray-500 text-xs">Last updated: {lastUpdated.toLocaleTimeString()}</div>
        )}
      </CardContent>
    </Card>
  )
}
