"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Search, Download, ExternalLink, Filter } from "lucide-react"

interface PaymentRecord {
  id: string
  date: string
  recipient: string
  amount: string
  chain: string
  status: "completed" | "failed" | "pending"
  txHash: string
  gasUsed: string
  gasCost: string
}

const MOCK_HISTORY: PaymentRecord[] = [
  {
    id: "1",
    date: "2024-01-15 14:30:22",
    recipient: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
    amount: "100.00",
    chain: "Ethereum",
    status: "completed",
    txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    gasUsed: "21000",
    gasCost: "0.0052",
  },
  {
    id: "2",
    date: "2024-01-15 12:15:45",
    recipient: "0x8ba1f109551bD432803012645Hac136c0532925a",
    amount: "250.50",
    chain: "Polygon",
    status: "completed",
    txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    gasUsed: "21000",
    gasCost: "0.0001",
  },
  {
    id: "3",
    date: "2024-01-15 10:45:12",
    recipient: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    amount: "75.25",
    chain: "Arbitrum",
    status: "completed",
    txHash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
    gasUsed: "21000",
    gasCost: "0.0008",
  },
  {
    id: "4",
    date: "2024-01-14 16:20:33",
    recipient: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
    amount: "500.00",
    chain: "Optimism",
    status: "failed",
    txHash: "0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    gasUsed: "0",
    gasCost: "0.0000",
  },
  {
    id: "5",
    date: "2024-01-14 09:30:15",
    recipient: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
    amount: "150.75",
    chain: "BSC",
    status: "completed",
    txHash: "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    gasUsed: "21000",
    gasCost: "0.0003",
  },
]

export function PaymentHistory() {
  const [history, setHistory] = useState<PaymentRecord[]>(MOCK_HISTORY)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [chainFilter, setChainFilter] = useState<string>("all")

  const filteredHistory = history.filter((record) => {
    const matchesSearch =
      record.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.amount.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || record.status === statusFilter
    const matchesChain = chainFilter === "all" || record.chain === chainFilter

    return matchesSearch && matchesStatus && matchesChain
  })

  const getStatusColor = (status: PaymentRecord["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ["Date", "Recipient", "Amount", "Chain", "Status", "Transaction Hash", "Gas Used", "Gas Cost"],
      ...filteredHistory.map((record) => [
        record.date,
        record.recipient,
        record.amount,
        record.chain,
        record.status,
        record.txHash,
        record.gasUsed,
        record.gasCost,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "payment-history.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const totalAmount = filteredHistory.reduce((sum, record) => sum + Number.parseFloat(record.amount), 0)
  const totalGasCost = filteredHistory.reduce((sum, record) => sum + Number.parseFloat(record.gasCost), 0)
  const completedCount = filteredHistory.filter((r) => r.status === "completed").length

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <History className="h-5 w-5" />
              Payment History
            </CardTitle>
            <CardDescription className="text-gray-400">Track and analyze your payment transactions</CardDescription>
          </div>

          <Button
            onClick={exportToCSV}
            size="sm"
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="text-2xl font-bold text-blue-400">${totalAmount.toFixed(2)}</div>
            <div className="text-sm text-blue-300">Total Volume</div>
          </div>

          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="text-2xl font-bold text-green-400">{completedCount}</div>
            <div className="text-sm text-green-300">Successful Payments</div>
          </div>

          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="text-2xl font-bold text-purple-400">${totalGasCost.toFixed(4)}</div>
            <div className="text-sm text-purple-300">Total Gas Fees</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by recipient, amount, or transaction hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40 bg-gray-800 border-gray-700 text-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all" className="text-white hover:bg-gray-700">
                All Status
              </SelectItem>
              <SelectItem value="completed" className="text-white hover:bg-gray-700">
                Completed
              </SelectItem>
              <SelectItem value="failed" className="text-white hover:bg-gray-700">
                Failed
              </SelectItem>
              <SelectItem value="pending" className="text-white hover:bg-gray-700">
                Pending
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={chainFilter} onValueChange={setChainFilter}>
            <SelectTrigger className="w-full md:w-40 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all" className="text-white hover:bg-gray-700">
                All Chains
              </SelectItem>
              <SelectItem value="Ethereum" className="text-white hover:bg-gray-700">
                Ethereum
              </SelectItem>
              <SelectItem value="Polygon" className="text-white hover:bg-gray-700">
                Polygon
              </SelectItem>
              <SelectItem value="Arbitrum" className="text-white hover:bg-gray-700">
                Arbitrum
              </SelectItem>
              <SelectItem value="Optimism" className="text-white hover:bg-gray-700">
                Optimism
              </SelectItem>
              <SelectItem value="BSC" className="text-white hover:bg-gray-700">
                BSC
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment History Table */}
        <ScrollArea className="h-96 rounded-lg border border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800/50">
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Recipient</TableHead>
                <TableHead className="text-gray-300">Amount</TableHead>
                <TableHead className="text-gray-300">Chain</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Gas Cost</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((record) => (
                <TableRow key={record.id} className="border-gray-700 hover:bg-gray-800/50">
                  <TableCell className="text-gray-300 font-mono text-sm">
                    {new Date(record.date).toLocaleDateString()}
                    <br />
                    <span className="text-xs text-gray-500">{new Date(record.date).toLocaleTimeString()}</span>
                  </TableCell>

                  <TableCell className="text-gray-300 font-mono">
                    {record.recipient.slice(0, 6)}...{record.recipient.slice(-4)}
                  </TableCell>

                  <TableCell className="text-white font-medium">${record.amount} USDC</TableCell>

                  <TableCell>
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                      {record.chain}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                  </TableCell>

                  <TableCell className="text-gray-300">${record.gasCost}</TableCell>

                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white hover:bg-gray-700"
                      onClick={() => window.open(`https://etherscan.io/tx/${record.txHash}`, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        {filteredHistory.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No payments found</div>
            <div className="text-sm text-gray-500">Try adjusting your search or filter criteria</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
