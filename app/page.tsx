"use client"

import { PaymentScheduler } from "./components/payment-scheduler"
import { PaymentExecutor } from "./components/payment-executor"
import { PaymentHistory } from "./components/payment-history"
import { FeeOptimizer } from "./components/fee-optimizer"
import { LiFiIntegration } from "./components/lifi-integration"
import { MetaMaskConnector } from "./components/metamask-connector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Zap, Shield, Globe, Clock, TrendingUp } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30">
                <Sparkles className="h-6 w-6 text-blue-400" />
              </div>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-3 py-1">Multichain DeFi</Badge>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              USDC Payment Scheduler
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Automate your USDC payments across multiple blockchains with intelligent fee optimization, cross-chain
              bridging, and enterprise-grade security.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
                  <p className="text-sm text-gray-300">Lightning Fast</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-green-400" />
                  <p className="text-sm text-gray-300">Secure & Audited</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <Globe className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                  <p className="text-sm text-gray-300">Multi-Chain</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                  <p className="text-sm text-gray-300">Fee Optimized</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Application */}
          <Tabs defaultValue="scheduler" className="space-y-8">
            <TabsList className="grid w-full grid-cols-6 bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
              <TabsTrigger
                value="scheduler"
                className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400"
              >
                <Clock className="h-4 w-4 mr-2" />
                Schedule
              </TabsTrigger>
              <TabsTrigger
                value="executor"
                className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400"
              >
                <Zap className="h-4 w-4 mr-2" />
                Execute
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400"
              >
                History
              </TabsTrigger>
              <TabsTrigger
                value="optimizer"
                className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400"
              >
                Optimize
              </TabsTrigger>
              <TabsTrigger
                value="bridge"
                className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400"
              >
                Bridge
              </TabsTrigger>
              <TabsTrigger
                value="wallet"
                className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400"
              >
                Wallet
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scheduler" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <PaymentScheduler />
                </div>
                <div className="space-y-6">
                  <FeeOptimizer />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="executor" className="space-y-6">
              <PaymentExecutor />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <PaymentHistory />
            </TabsContent>

            <TabsContent value="optimizer" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FeeOptimizer />
                <LiFiIntegration />
              </div>
            </TabsContent>

            <TabsContent value="bridge" className="space-y-6">
              <LiFiIntegration />
            </TabsContent>

            <TabsContent value="wallet" className="space-y-6">
              <MetaMaskConnector />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 border-t border-gray-800">
          <div className="text-center text-gray-400">
            <p className="mb-2">Built with Next.js, LI.FI SDK, and Web3 technologies</p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span>Ethereum</span>
              <span>•</span>
              <span>Polygon</span>
              <span>•</span>
              <span>Arbitrum</span>
              <span>•</span>
              <span>Optimism</span>
              <span>•</span>
              <span>BSC</span>
              <span>•</span>
              <span>Avalanche</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
