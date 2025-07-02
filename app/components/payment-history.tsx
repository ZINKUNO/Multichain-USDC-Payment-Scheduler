"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertCircle, ExternalLink, Calendar } from "lucide-react"

const MOCK_PAYMENTS = [
  {
    id: 1,
    recipient: "0x742d35Cc6634C0532925a3b8D4C9db4C4b8b4b8b",
    amount: 100,
    status: "completed",
    chain: "Polygon Mumbai",
    fee: 0.12,
    savings: 65,
    executedAt: new Date(Date.now() - 86400000), // 1 day ago
    txHash: "0xabc123...",
  },
  {
    id: 2,
    recipient: "0x123d35Cc6634C0532925a3b8D4C9db4C4b8b4b8b",
    amount: 250,
    status: "scheduled",
    chain: "Arbitrum Sepolia",
    fee: 0.08,
    savings: 72,
    scheduledFor: new Date(Date.now() + 3600000), // 1 hour from now
  },
  {
    id: 3,
    recipient: "0x456d35Cc6634C0532925a3b8D4C9db4C4b8b4b8b",
    amount: 50,
    status: "failed",
    chain: "Ethereum Sepolia",
    fee: 1.25,
    savings: 0,
    executedAt: new Date(Date.now() - 172800000), // 2 days ago
    error: "Insufficient USDC balance",
  },
]

export function PaymentHistory() {
  const [payments, setPayments] = useState(MOCK_PAYMENTS)
  const [filter, setFilter] = useState("all")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "scheduled":
        return <Clock className="w-4 h-4 text-blue-600" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      scheduled: "secondary",
      failed: "destructive",
    }
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const filteredPayments = payments.filter((payment) => filter === "all" || payment.status === filter)

  const totalSaved = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (p.savings / 100) * p.fee, 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold">{payments.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold">${payments.reduce((sum, p) => sum + p.amount, 0)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fees Saved</p>
                <p className="text-2xl font-bold text-green-600">${totalSaved.toFixed(2)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {["all", "completed", "scheduled", "failed"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Payment List */}
      <div className="space-y-4">
        {filteredPayments.map((payment) => (
          <Card key={payment.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(payment.status)}
                  <div>
                    <p className="font-semibold">${payment.amount} USDC</p>
                    <p className="text-sm text-gray-600">
                      To: {payment.recipient.slice(0, 6)}...{payment.recipient.slice(-4)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {getStatusBadge(payment.status)}
                  <p className="text-sm text-gray-600 mt-1">{payment.chain}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Fee</p>
                  <p className="font-medium">${payment.fee.toFixed(2)}</p>
                </div>

                {payment.savings > 0 && (
                  <div>
                    <p className="text-gray-600">Savings</p>
                    <p className="font-medium text-green-600">{payment.savings}%</p>
                  </div>
                )}

                <div>
                  <p className="text-gray-600">{payment.status === "scheduled" ? "Scheduled For" : "Executed At"}</p>
                  <p className="font-medium">{(payment.executedAt || payment.scheduledFor)?.toLocaleDateString()}</p>
                </div>

                {payment.txHash && (
                  <div>
                    <p className="text-gray-600">Transaction</p>
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                )}
              </div>

              {payment.error && (
                <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-700">Error: {payment.error}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPayments.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No payments found</h3>
            <p className="text-gray-600">
              {filter === "all" ? "Schedule your first payment to see it here" : `No ${filter} payments found`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
