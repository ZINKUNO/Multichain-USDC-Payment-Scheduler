"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, Zap, TrendingDown, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { lifiService } from "@/app/lib/lifi-integration"

interface LiFiStatus {
  isConnected: boolean
  supportedChains: number
  availableTools: number
  lastUpdated: Date | null
}

export function LiFiIntegration() {
  const [status, setStatus] = useState<LiFiStatus>({
    isConnected: false,
    supportedChains: 0,
    availableTools: 0,
    lastUpdated: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkLiFiStatus = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Test LI.FI API connection
      const [chains, tools] = await Promise.all([lifiService.getSupportedChains(), lifiService.getTools()])

      setStatus({
        isConnected: true,
        supportedChains: chains.length,
        availableTools: tools.length,
        lastUpdated: new Date(),
      })
    } catch (err: any) {
      setError(err.message || "Failed to connect to LI.FI API")
      setStatus((prev) => ({ ...prev, isConnected: false }))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkLiFiStatus()
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              
              LI.FI Integration
            </CardTitle>
            <CardDescription>Cross-chain liquidity aggregation for optimal fee routing</CardDescription>
          </div>
          <Button onClick={checkLiFiStatus} disabled={isLoading} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {status.isConnected ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-red-500" />
            )}
            <span className="font-medium">{status.isConnected ? "Connected" : "Disconnected"}</span>
          </div>
          <Badge variant={status.isConnected ? "default" : "destructive"}>
            {status.isConnected ? "Active" : "Error"}
          </Badge>
        </div>

        {/* API Statistics */}
        {status.isConnected && (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{status.supportedChains}</div>
              <div className="text-sm text-blue-800">Supported Chains</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{status.availableTools}</div>
              <div className="text-sm text-purple-800">Available Bridges</div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* API Key Info */}
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-800">API Configuration</span>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <div>Integrator ID: usdc-payment-scheduler</div>
            <div>API Key: 77ad3ad2-7cc8-47b5-****</div>
            <div>Environment: Production</div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <h4 className="font-medium">Enabled Features</h4>
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-sm">
              <TrendingDown className="w-4 h-4 text-green-600" />
              <span>Real-time gas price optimization</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Cross-chain route comparison</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ExternalLink className="w-4 h-4 text-purple-600" />
              <span>Multi-bridge aggregation</span>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        {status.lastUpdated && (
          <div className="text-xs text-gray-500 text-center">
            Last updated: {status.lastUpdated.toLocaleTimeString()}
          </div>
        )}

        {/* External Links */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            
          </Button>
          <Button variant="outline" size="sm" asChild>
            
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
