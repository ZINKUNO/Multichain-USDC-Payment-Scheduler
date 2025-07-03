"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Clock, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import { useWallet } from "../hooks/use-wallet"

// Contract configuration
const CONTRACT_ADDRESSES = {
  11155111: "0xYourSepoliaContractAddress", // Replace with actual deployed address
  80001: "0xYourMumbaiContractAddress", // Replace with actual deployed address
  421614: "0xYourArbitrumSepoliaContractAddress", // Replace with actual deployed address
}

const USDC_ADDRESSES = {
  11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia USDC
  80001: "0x0FA8781a83E468F3b7C25308B9421c0c1bE7a6B0", // Mumbai USDC
  421614: "0x75faf114eafb1BDbe6fc3363c7f609b9d5a8f3dA", // Arbitrum Sepolia USDC
}

const CONTRACT_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "_paymentId", type: "uint256" }],
    name: "executePayment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_paymentId", type: "uint256" }],
    name: "getPayment",
    outputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "interval", type: "uint256" },
      { internalType: "uint256", name: "nextExecution", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paymentCounter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
]

const USDC_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
]

interface ScheduledPayment {
  id: number
  recipient: string
  amount: string
  interval: number
  nextExecution: Date
  chainId: number
  isExecutable: boolean
}

export function PaymentExecutor() {
  const { isConnected, account, chainId, switchChain } = useWallet()
  const [payments, setPayments] = useState<ScheduledPayment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [executionStatus, setExecutionStatus] = useState<string>("")
  const [executingPayments, setExecutingPayments] = useState<Set<number>>(new Set())

  // Mock data for demo purposes
  const mockPayments: ScheduledPayment[] = [
    {
      id: 1,
      recipient: "0x742d35Cc6634C0532925a3b8D4C9db4C4b8b4b8b",
      amount: "100",
      interval: 3600, // 1 hour
      nextExecution: new Date(Date.now() + 30000), // 30 seconds from now
      chainId: 11155111,
      isExecutable: true,
    },
    {
      id: 2,
      recipient: "0x123d35Cc6634C0532925a3b8D4C9db4C4b8b4b8b",
      amount: "250",
      interval: 86400, // 1 day
      nextExecution: new Date(Date.now() + 3600000), // 1 hour from now
      chainId: 80001,
      isExecutable: false,
    },
    {
      id: 3,
      recipient: "0x456d35Cc6634C0532925a3b8D4C9db4C4b8b4b8b",
      amount: "50",
      interval: 1800, // 30 minutes
      nextExecution: new Date(Date.now() - 60000), // 1 minute ago (ready to execute)
      chainId: 421614,
      isExecutable: true,
    },
  ]

  useEffect(() => {
    if (isConnected) {
      fetchPayments()
    }
  }, [isConnected, chainId])

  const fetchPayments = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would fetch from the smart contract
      // For demo purposes, we'll use mock data
      const now = new Date()
      const updatedPayments = mockPayments.map((payment) => ({
        ...payment,
        isExecutable: payment.nextExecution <= now,
      }))
      setPayments(updatedPayments)
    } catch (error) {
      console.error("Failed to fetch payments:", error)
      setExecutionStatus("Failed to fetch scheduled payments")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExecutePayment = async (payment: ScheduledPayment) => {
    if (!isConnected || !account) {
      setExecutionStatus("Please connect your wallet")
      return
    }

    setExecutingPayments((prev) => new Set(prev).add(payment.id))
    setExecutionStatus("")

    try {
      // Step 1: Switch to the correct chain if needed
      if (chainId !== payment.chainId) {
        setExecutionStatus(`Switching to ${getChainName(payment.chainId)}...`)
        await switchChain(payment.chainId)
        await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait for chain switch
      }

      // Step 2: Check if payment is executable
      if (!payment.isExecutable) {
        throw new Error("Payment is not yet due for execution")
      }

      // Step 3: Simulate contract interaction
      setExecutionStatus(`Executing payment ${payment.id}...`)

      // In a real implementation, you would:
      // 1. Check USDC balance and allowance
      // 2. Approve USDC if needed
      // 3. Call the executePayment function on the smart contract

      // For demo purposes, simulate the execution
      await simulatePaymentExecution(payment)

      setExecutionStatus(`Payment ${payment.id} executed successfully! 🎉`)

      // Update the payment status
      setPayments((prev) =>
        prev.map((p) =>
          p.id === payment.id
            ? {
                ...p,
                nextExecution: new Date(p.nextExecution.getTime() + p.interval * 1000),
                isExecutable: false,
              }
            : p,
        ),
      )
    } catch (error: any) {
      console.error("Payment execution failed:", error)
      setExecutionStatus(`Failed to execute payment ${payment.id}: ${error.message}`)
    } finally {
      setExecutingPayments((prev) => {
        const newSet = new Set(prev)
        newSet.delete(payment.id)
        return newSet
      })
    }
  }

  const simulatePaymentExecution = async (payment: ScheduledPayment): Promise<void> => {
    // Simulate network delay and contract interaction
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Simulate potential errors (10% chance)
    if (Math.random() < 0.1) {
      throw new Error("Insufficient USDC balance")
    }
  }

  const getChainName = (chainId: number): string => {
    switch (chainId) {
      case 11155111:
        return "Ethereum Sepolia"
      case 80001:
        return "Polygon Mumbai"
      case 421614:
        return "Arbitrum Sepolia"
      default:
        return `Chain ${chainId}`
    }
  }

  const getChainColor = (chainId: number): string => {
    switch (chainId) {
      case 11155111:
        return "bg-blue-500"
      case 80001:
        return "bg-purple-500"
      case 421614:
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const isPaymentExecuting = (paymentId: number): boolean => {
    return executingPayments.has(paymentId)
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600">Connect MetaMask to view and execute scheduled payments</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Execute Payments
          </CardTitle>
          <CardDescription>
            Manually execute scheduled payments . In production, payments would be executed automatically using Chainlink Automation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {executionStatus && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{executionStatus}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            
            <span>Smart contracts deployed on Sepolia, Mumbai, and Arbitrum Sepolia testnets</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading scheduled payments...</p>
            </CardContent>
          </Card>
        ) : payments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No Scheduled Payments</h3>
              <p className="text-gray-600">Schedule your first payment to see it here</p>
            </CardContent>
          </Card>
        ) : (
          payments.map((payment) => (
            <Card key={payment.id} className={payment.isExecutable ? "ring-2 ring-green-500" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getChainColor(payment.chainId)}`} />
                    <div>
                      <h3 className="font-semibold">Payment #{payment.id}</h3>
                      <p className="text-sm text-gray-600">
                        To: {payment.recipient.slice(0, 6)}...{payment.recipient.slice(-4)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold">${payment.amount} USDC</span>
                      {payment.isExecutable && (
                        <Badge variant="default" className="bg-green-500">
                          Ready
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{getChainName(payment.chainId)}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Amount</p>
                    <p className="font-medium">${payment.amount} USDC</p>
                  </div>

                  <div>
                    <p className="text-gray-600">Interval</p>
                    <p className="font-medium">{Math.floor(payment.interval / 3600)}h</p>
                  </div>

                  <div>
                    <p className="text-gray-600">Next Execution</p>
                    <p className="font-medium">{payment.nextExecution.toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className={`font-medium ${payment.isExecutable ? "text-green-600" : "text-orange-600"}`}>
                      {payment.isExecutable ? "Ready" : "Pending"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={() => handleExecutePayment(payment)}
                    disabled={!payment.isExecutable || isPaymentExecuting(payment.id)}
                    variant={payment.isExecutable ? "default" : "secondary"}
                    size="sm"
                  >
                    {isPaymentExecuting(payment.id) ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Executing...
                      </>
                    ) : payment.isExecutable ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Execute Payment
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Not Due Yet
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How Manual Execution Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
              1
            </div>
            <div>
              <p className="font-medium">Payment Validation</p>
              <p className="text-gray-600">
                System checks if the payment's nextExecution timestamp has been reached and validates payment details
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
              2
            </div>
            <div>
              <p className="font-medium">Chain Switching & USDC Approval</p>
              <p className="text-gray-600">
                MetaMask switches to the correct chain and approves USDC spending if insufficient allowance
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
              3
            </div>
            <div>
              <p className="font-medium">Smart Contract Execution</p>
              <p className="text-gray-600">
                The executePayment function transfers USDC to the recipient and updates the next execution time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Production: Chainlink Automation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-gray-600">
            For production deployment, this manual execution would be replaced by <strong>Chainlink Automation</strong>,
            which automatically executes payments when their scheduled time arrives. The smart contract includes{" "}
            <code>checkUpkeep</code> and <code>performUpkeep</code> functions for this purpose.
          </p>
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-blue-800">
              <strong>Demo Note:</strong> This interface demonstrates the manual execution flow. In production, users
              would only need to schedule payments - execution would happen automatically via Chainlink Automation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
