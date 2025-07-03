"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Pause, Square, CheckCircle, AlertCircle, Clock, Zap } from "lucide-react"

interface PaymentExecution {
  id: string
  recipient: string
  amount: string
  chain: string
  status: "pending" | "executing" | "completed" | "failed"
  progress: number
  txHash?: string
  error?: string
  estimatedTime?: number
}

const MOCK_PAYMENTS: PaymentExecution[] = [
  {
    id: "1",
    recipient: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
    amount: "100.00",
    chain: "Polygon",
    status: "pending",
    progress: 0,
    estimatedTime: 30,
  },
  {
    id: "2",
    recipient: "0x8ba1f109551bD432803012645Hac136c22C177",
    amount: "250.00",
    chain: "Arbitrum",
    status: "executing",
    progress: 65,
    txHash: "0x1234...5678",
    estimatedTime: 15,
  },
  {
    id: "3",
    recipient: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    amount: "50.00",
    chain: "Ethereum",
    status: "completed",
    progress: 100,
    txHash: "0xabcd...efgh",
  },
]

export function PaymentExecutor() {
  const [payments, setPayments] = useState<PaymentExecution[]>(MOCK_PAYMENTS)
  const [globalStatus, setGlobalStatus] = useState<"idle" | "running" | "paused">("idle")

  const executePayment = async (paymentId: string) => {
    setPayments((prev) => prev.map((p) => (p.id === paymentId ? { ...p, status: "executing", progress: 0 } : p)))

    // Simulate payment execution
    const interval = setInterval(() => {
      setPayments((prev) =>
        prev.map((p) => {
          if (p.id === paymentId && p.status === "executing") {
            const newProgress = Math.min(p.progress + 10, 100)
            if (newProgress === 100) {
              clearInterval(interval)
              return {
                ...p,
                status: "completed",
                progress: 100,
                txHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
              }
            }
            return { ...p, progress: newProgress }
          }
          return p
        }),
      )
    }, 500)
  }

  const pausePayment = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId && p.status === "executing" ? { ...p, status: "pending" } : p)),
    )
  }

  const cancelPayment = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: "failed", error: "Cancelled by user" } : p)),
    )
  }

  const startAllPayments = () => {
    setGlobalStatus("running")
    payments
      .filter((p) => p.status === "pending")
      .forEach((p) => {
        executePayment(p.id)
      })
  }

  const pauseAllPayments = () => {
    setGlobalStatus("paused")
    payments
      .filter((p) => p.status === "executing")
      .forEach((p) => {
        pausePayment(p.id)
      })
  }

  const getStatusIcon = (status: PaymentExecution["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />
      case "executing":
        return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-400" />
    }
  }

  const getStatusColor = (status: PaymentExecution["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "executing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
    }
  }

  const getChainColor = (chain: string) => {
    switch (chain) {
      case "Ethereum":
        return "bg-blue-500"
      case "Polygon":
        return "bg-purple-500"
      case "Arbitrum":
        return "bg-cyan-500"
      case "Optimism":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const pendingCount = payments.filter((p) => p.status === "pending").length
  const executingCount = payments.filter((p) => p.status === "executing").length
  const completedCount = payments.filter((p) => p.status === "completed").length

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-400" />
              Payment Executor
            </CardTitle>
            <CardDescription className="text-gray-400">Execute scheduled payments across chains</CardDescription>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={startAllPayments}
              disabled={pendingCount === 0 || globalStatus === "running"}
              className="border-green-600 text-green-400 hover:bg-green-600/10 bg-transparent"
            >
              <Play className="w-4 h-4 mr-1" />
              Start All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={pauseAllPayments}
              disabled={executingCount === 0}
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10 bg-transparent"
            >
              <Pause className="w-4 h-4 mr-1" />
              Pause All
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="text-yellow-400 text-sm">Pending</div>
            <div className="text-white text-2xl font-bold">{pendingCount}</div>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="text-blue-400 text-sm">Executing</div>
            <div className="text-white text-2xl font-bold">{executingCount}</div>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="text-green-400 text-sm">Completed</div>
            <div className="text-white text-2xl font-bold">{completedCount}</div>
          </div>
        </div>

        {/* Payment Queue */}
        <div className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(payment.status)}
                  <div>
                    <div className="text-white font-medium">{payment.amount} USDC</div>
                    <div className="text-gray-400 text-sm">
                      to {payment.recipient.slice(0, 6)}...{payment.recipient.slice(-4)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getChainColor(payment.chain)}`} />
                  <span className="text-gray-300 text-sm">{payment.chain}</span>
                  <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                </div>
              </div>

              {payment.status === "executing" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{payment.progress}%</span>
                  </div>
                  <Progress value={payment.progress} className="h-2" />
                  {payment.estimatedTime && (
                    <div className="text-gray-400 text-xs">Est. {payment.estimatedTime}s remaining</div>
                  )}
                </div>
              )}

              {payment.txHash && (
                <div className="mt-2 p-2 rounded bg-gray-700/50">
                  <div className="text-gray-400 text-xs">Transaction Hash</div>
                  <div className="text-blue-400 text-sm font-mono">{payment.txHash}</div>
                </div>
              )}

              {payment.error && (
                <Alert className="mt-2 border-red-500/50 bg-red-500/10">
                  <AlertDescription className="text-red-400 text-sm">{payment.error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 mt-3">
                {payment.status === "pending" && (
                  <Button
                    size="sm"
                    onClick={() => executePayment(payment.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Execute
                  </Button>
                )}

                {payment.status === "executing" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => pausePayment(payment.id)}
                    className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
                  >
                    <Pause className="w-3 h-3 mr-1" />
                    Pause
                  </Button>
                )}

                {(payment.status === "pending" || payment.status === "executing") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => cancelPayment(payment.id)}
                    className="border-red-600 text-red-400 hover:bg-red-600/10"
                  >
                    <Square className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {payments.length === 0 && (
          <div className="text-center py-8 text-gray-400">No payments scheduled for execution</div>
        )}
      </CardContent>
    </Card>
  )
}
