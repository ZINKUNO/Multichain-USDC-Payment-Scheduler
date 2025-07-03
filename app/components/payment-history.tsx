"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, ExternalLink, History, Calendar } from "lucide-react"

interface PaymentRecord {
  id: string
  date: string
  recipient: string
  amount: string
  chain: string
  status: "completed" | "failed" | "pending"
  txHash: string
  gasUsed: string
  description?: string
}

const MOCK_HISTORY: PaymentRecord[] = [
  {
    id: "1",
    date: "2024-01-15T10:30:00Z",
    recipient: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
    amount: "100.00",
    chain: "Polygon",
    status: "completed",
    txHash: "0x1234567890abcdef1234567890abcdef12345678",
    gasUsed: "0.002",
    description: "Monthly salary payment",
  },
  {
    id: "2",
    date: "2024-01-14T15:45:00Z",
    recipient: "0x8ba1f109551bD432803012645Hac136c22C177",
    amount: "250.00",
    chain: "Arbitrum",
    status: "completed",
    txHash: "0xabcdef1234567890abcdef1234567890abcdef12",
    gasUsed: "0.001",
    description: "Contractor payment",
  },
  {
    id: "3",
    date: "2024-01-13T09:15:00Z",
    recipient: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    amount: "50.00",
    chain: "Ethereum",
    status: "failed",
    txHash: "0xfedcba0987654321fedcba0987654321fedcba09",
    gasUsed: "0.005",
    description: "Refund payment",
  },
  {
    id: "4",
    date: "2024-01-12T14:20:00Z",
    recipient: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    amount: "75.00",
    chain: "Optimism",
    status: "completed",
    txHash: "0x567890abcdef1234567890abcdef1234567890ab",
    gasUsed: "0.0008",
    description: "Service payment",
  },
  {
    id: "5",
    date: "2024-01-11T11:00:00Z",
    recipient: "0xA0b86a33E6441E6C8C7C7b0b1b6C8C7b0b1b6C8C",
    amount: "200.00",
    chain: "Polygon",
    status: "completed",
    txHash: "0xcdef1234567890abcdef1234567890abcdef1234",
    gasUsed: "0.0015",
    description: "Weekly payment",
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
      record.description?.toLowerCase().includes(searchTerm.toLowerCase())

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

  const exportHistory = () => {
    const csv = [
      ["Date", "Recipient", "Amount", "Chain", "Status", "TX Hash", "Gas Used", "Description"],
      ...filteredHistory.map((record) => [
        new Date(record.date).toLocaleDateString(),
        record.recipient,
        record.amount,
        record.chain,
        record.status,
        record.txHash,
        record.gasUsed,
        record.description || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "payment-history.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalAmount = filteredHistory
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + Number.parseFloat(r.amount), 0)

  const totalGasUsed = filteredHistory
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + Number.parseFloat(r.gasUsed), 0)

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <History className="w-5 h-5 text-blue-400" />
              Payment History
            </CardTitle>
            <CardDescription className="text-gray-400">Track all your USDC payment transactions</CardDescription>
          </div>

          <Button
            onClick={exportHistory}
            variant="outline"
            size="sm"
            className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
          >
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-gray-800/50">
            <div className="text-gray-400 text-sm">Total Payments</div>
            <div className="text-white text-2xl font-bold">{filteredHistory.length}</div>
          </div>
          <div className="p-3 rounded-lg bg-gray-800/50">
            <div className="text-gray-400 text-sm">Total Amount</div>
            <div className="text-white text-2xl font-bold">${totalAmount.toFixed(2)}</div>
          </div>
          <div className="p-3 rounded-lg bg-gray-800/50">
            <div className="text-gray-400 text-sm">Total Gas Used</div>
            <div className="text-white text-2xl font-bold">{totalGasUsed.toFixed(4)} ETH</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by address, hash, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40 bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Status" />
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
              <SelectValue placeholder="Chain" />
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
            </SelectContent>
          </Select>
        </div>

        {/* History Table */}
        <div className="rounded-lg border border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800/50">
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Recipient</TableHead>
                <TableHead className="text-gray-300">Amount</TableHead>
                <TableHead className="text-gray-300">Chain</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Gas</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((record) => (
                <TableRow key={record.id} className="border-gray-700 hover:bg-gray-800/30">
                  <TableCell className="text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <div>
                      <div className="font-mono text-sm">
                        {record.recipient.slice(0, 6)}...{record.recipient.slice(-4)}
                      </div>
                      {record.description && <div className="text-gray-500 text-xs">{record.description}</div>}
                    </div>
                  </TableCell>
                  <TableCell className="text-white font-medium">${record.amount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getChainColor(record.chain)}`} />
                      <span className="text-gray-300">{record.chain}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{record.gasUsed} ETH</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                      onClick={() => window.open(`https://etherscan.io/tx/${record.txHash}`, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-8 text-gray-400">No payment records found matching your filters</div>
        )}
      </CardContent>
    </Card>
  )
}
