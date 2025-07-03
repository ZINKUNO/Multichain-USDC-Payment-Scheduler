"use client"

import { useState } from "react"
import { MetaMaskConnector } from "./components/metamask-connector"
import { PaymentScheduler } from "./components/payment-scheduler"
import { FeeOptimizer } from "./components/fee-optimizer"
import { PaymentHistory } from "./components/payment-history"
import { PaymentExecutor } from "./components/payment-executor"
import { useWallet } from "./hooks/use-wallet"
import { LiFiIntegration } from "./components/lifi-integration"

export default function USDCPaymentScheduler() {
  const { isConnected, account, chainId, connectWallet, switchChain } = useWallet()
  const [activeTab, setActiveTab] = useState("schedule")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">$</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">USDC Payment Scheduler</h1>
                <p className="text-gray-400 text-sm">Multichain payment automation platform</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Payments
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Analytics
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Settings
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Automate Your
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {" "}
                USDC Payments
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Schedule, optimize, and execute cross-chain USDC payments with intelligent fee optimization and seamless
              multichain support powered by LI.FI infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
                Get Started
              </button>
              <button className="px-8 py-4 border border-gray-600 text-gray-300 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <PaymentScheduler />
            <PaymentExecutor />
            <PaymentHistory />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <MetaMaskConnector />
            <FeeOptimizer />
            <LiFiIntegration />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">$</span>
              </div>
              <span className="text-gray-300">USDC Payment Scheduler</span>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Support
              </a>
              <span>© 2024 All rights reserved</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
