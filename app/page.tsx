"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, Send, Clock, TrendingDown, CheckCircle, AlertCircle } from "lucide-react"
import { MetaMaskConnector } from "./components/metamask-connector"
import { PaymentScheduler } from "./components/payment-scheduler"
import { FeeOptimizer } from "./components/fee-optimizer"
import { PaymentHistory } from "./components/payment-history"
import { useWallet } from "./hooks/use-wallet"

export default function USDCPaymentScheduler() {
  const { isConnected, account, chainId, connectWallet, switchChain } = useWallet()
  const [activeTab, setActiveTab] = useState("schedule")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Multichain USDC Payment Scheduler</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Schedule recurring USDC payments across multiple blockchains with optimized fees using real-time gas price
            data
          </p>
        </div>

        {/* Connection Status */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <MetaMaskConnector />
          </CardContent>
        </Card>

        {/* Main Content */}
        {isConnected ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="optimize" className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Optimize
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="execute" className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Execute
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schedule">
              <PaymentScheduler />
            </TabsContent>

            <TabsContent value="optimize">
              <FeeOptimizer />
            </TabsContent>

            <TabsContent value="history">
              <PaymentHistory />
            </TabsContent>

            <TabsContent value="execute">
              <Card>
                <CardHeader>
                  <CardTitle>Execute Payments</CardTitle>
                  <CardDescription>Manually execute scheduled payments (Demo mode)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      In production, payments would be executed automatically using Chainlink Automation. For this demo,
                      you can manually trigger payment execution.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-gray-600 mb-4">Connect your MetaMask wallet to start scheduling USDC payments</p>
            </CardContent>
          </Card>
        )}

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Smart Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Schedule recurring USDC payments with flexible intervals and automatic execution
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-green-600" />
                Fee Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Automatically select the lowest-cost blockchain for each payment using real-time gas data
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-purple-600" />
                Cross-Chain Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Seamless USDC transfers across Ethereum, Polygon, and Arbitrum using Circle CCTP V2
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
