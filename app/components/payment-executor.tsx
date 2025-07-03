"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, ExternalLink, Clock, CheckCircle, XCircle } from "lucide-react"

interface PaymentExecution {
  id: string
  recipient: string
  amount: string
  chain: string
  status: "pending" | "executing" | "completed" | "failed"
  progress: number
  txHash?: string
  estimatedTime?: number
  error?: string
}

const MOCK_PAYMENTS: PaymentExecution[] = [
  {
    id: "1",
    recipient: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
    amount: "100.00",
    chain: "Ethereum",
    status: "pending",
    progress: 0,
    estimatedTime: 180,
  },
  {
    id: "2",
    recipient: "0x8ba1f109551bD432803012645Hac136c0532925a",
    amount: "250.50",
    chain: "Polygon",
    status: "executing",
    progress: 65,
    estimatedTime: 45,
  },
  {
    id: "3",
    recipient: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    amount: "75.25",
    chain: "Arbitrum",
    status: "completed",
    progress: 100,
    txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  },
]

export function PaymentExecutor() {
  const [payments, setPayments] = useState<PaymentExecution[]>(MOCK_PAYMENTS)
  const [isExecutingAll, setIsExecutingAll] = useState(false)

  useEffect(() => {
    // Simulate payment execution progress
    const interval = setInterval(() => {
      setPayments((prev) =>
        prev.map((payment) => {
          if (payment.status === "executing" && payment.progress < 100) {
            const newProgress = Math.min(payment.progress + Math.random() * 10, 100)
            const newStatus = newProgress >= 100 ? "completed" : "executing"
            const txHash = newProgress >= 100 ? `0x${Math.random().toString(16).substr(2, 64)}` : payment.txHash

            return {
              ...payment,
              progress: newProgress,
              status: newStatus,
              txHash,
            }
          }
          return payment
        }),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const executePayment = (id: string) => {
    setPayments((prev) =>
      prev.map((payment) => (payment.id === id ? { ...payment, status: "executing", progress: 5 } : payment)),
    )
  }

  const pausePayment = (id: string) => {
    setPayments((prev) => prev.map((payment) => (payment.id === id ? { ...payment, status: "pending" } : payment)))
  }

  const executeAllPayments = () => {
    setIsExecutingAll(true)
    setPayments((prev) =>
      prev.map((payment) =>
        payment.status === "pending" ? { ...payment, status: "executing", progress: 5 } : payment,
      ),
    )

    setTimeout(() => setIsExecutingAll(false), 2000)
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
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: PaymentExecution["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "executing":
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "failed":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
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
              <Play className="h-5 w-5" />
              Payment Executor
            </CardTitle>
            <CardDescription className="text-gray-400">Execute and monitor scheduled payments</CardDescription>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={executeAllPayments}
              disabled={pendingCount === 0 || isExecutingAll}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isExecutingAll ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute All ({pendingCount})
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
            <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
            <div className="text-sm text-yellow-300">Pending</div>
          </div>

          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
            <div className="text-2xl font-bold text-blue-400">{executingCount}</div>
            <div className="text-sm text-blue-300">Executing</div>
          </div>

          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
            <div className="text-2xl font-bold text-green-400">{completedCount}</div>
            <div className="text-sm text-green-300">Completed</div>
          </div>
        </div>

        {/* Payment Queue */}
        <div className="space-y-4">
          <h4 className="text-white font-medium">Payment Queue</h4>

          {payments.map((payment) => (
            <div key={payment.id} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 space-y-3">
              {/* Payment Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(payment.status)}>
                    {getStatusIcon(payment.status)}
                    <span className="ml-1 capitalize">{payment.status}</span>
                  </Badge>
                  <span className="text-white font-medium">${payment.amount} USDC</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-300">{payment.chain}</span>
                </div>

                <div className="flex gap-2">
                  {payment.status === "pending" && (
                    <Button
                      onClick={() => executePayment(payment.id)}
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  )}

                  {payment.status === "executing" && (
                    <Button
                      onClick={() => pausePayment(payment.id)}
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                    >
                      <Pause className="h-3 w-3" />
                    </Button>
                  )}

                  {payment.txHash && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                      onClick={() => window.open(`https://etherscan.io/tx/${payment.txHash}`, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Recipient */}
              <div className="text-sm">
                <span className="text-gray-400">To: </span>
                <span className="text-gray-300 font-mono">
                  {payment.recipient.slice(0, 6)}...{payment.recipient.slice(-4)}
                </span>
              </div>

              {/* Progress Bar */}
              {payment.status === "executing" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{Math.round(payment.progress)}%</span>
                  </div>
                  <Progress value={payment.progress} className="bg-gray-700" />
                  {payment.estimatedTime && (
                    <div className="text-xs text-gray-500">Estimated time remaining: {payment.estimatedTime}s</div>
                  )}
                </div>
              )}

              {/* Transaction Hash */}
              {payment.txHash && (
                <div className="text-sm">
                  <span className="text-gray-400">Transaction: </span>
                  <span className="text-blue-400 font-mono">
                    {payment.txHash.slice(0, 10)}...{payment.txHash.slice(-8)}
                  </span>
                </div>
              )}

              {/* Error Message */}
              {payment.error && (
                <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
                  {payment.error}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
