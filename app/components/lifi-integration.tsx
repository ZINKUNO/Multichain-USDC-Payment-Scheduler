"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, RefreshCw, Activity, Link, Zap } from "lucide-react"
import { lifiService } from "@/app/lib/lifi-integration"

interface IntegrationStatus {
  isHealthy: boolean
  chains: number
  tools: number
  lastChecked: Date
  responseTime?: number
}

export function LiFiIntegration() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      const startTime = Date.now()
      const statusData = await lifiService.getStatus()
      const responseTime = Date.now() - startTime

      setStatus({
        ...statusData,
        lastChecked: new Date(),
        responseTime,
      })
    } catch (err) {
      setError("Failed to check LI.FI integration status")
      setStatus({
        isHealthy: false,
        chains: 0,
        tools: 0,
        lastChecked: new Date(),
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()

    // Check status every 60 seconds
    const interval = setInterval(checkStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (isHealthy: boolean) => {
    return isHealthy
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-red-500/20 text-red-400 border-red-500/30"
  }

  const getStatusIcon = (isHealthy: boolean) => {
    return isHealthy ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
  }

  if (loading && !status) {
    return (
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Link className="w-5 h-5 text-blue-400" />
            LI.FI Integration
          </CardTitle>
          <CardDescription className="text-gray-400">Checking cross-chain infrastructure...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 bg-gray-700" />
            <Skeleton className="h-6 w-16 bg-gray-700" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16 bg-gray-700" />
              <Skeleton className="h-6 w-8 bg-gray-700" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-16 bg-gray-700" />
              <Skeleton className="h-6 w-8 bg-gray-700" />
            </div>
          </div>
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
              <Link className="w-5 h-5 text-blue-400" />
              LI.FI Integration
            </CardTitle>
            <CardDescription className="text-gray-400">Cross-chain infrastructure status</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkStatus}
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

        {status && (
          <>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">API Status</span>
              </div>
              <Badge className={getStatusColor(status.isHealthy)}>
                {getStatusIcon(status.isHealthy)}
                {status.isHealthy ? "Healthy" : "Offline"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-gray-800/50">
                <div className="text-gray-400 text-sm">Supported Chains</div>
                <div className="text-white text-2xl font-bold">{status.chains}</div>
              </div>

              <div className="p-3 rounded-lg bg-gray-800/50">
                <div className="text-gray-400 text-sm">Available Tools</div>
                <div className="text-white text-2xl font-bold">{status.tools}</div>
              </div>
            </div>

            {status.responseTime && (
              <div className="p-3 rounded-lg bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">Response Time</span>
                  </div>
                  <span className="text-white font-medium">{status.responseTime}ms</span>
                </div>
              </div>
            )}

            <div className="text-center text-gray-500 text-xs">
              Last checked: {status.lastChecked.toLocaleTimeString()}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
