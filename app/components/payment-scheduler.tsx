"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, Clock, DollarSign, Repeat, Zap } from "lucide-react"
import { format } from "date-fns"

interface ScheduleFormData {
  recipient: string
  amount: string
  chain: string
  frequency: string
  startDate: Date | undefined
  endDate: Date | undefined
  description: string
}

const SUPPORTED_CHAINS = [
  { id: "1", name: "Ethereum", symbol: "ETH", color: "bg-blue-500" },
  { id: "137", name: "Polygon", symbol: "MATIC", color: "bg-purple-500" },
  { id: "42161", name: "Arbitrum", symbol: "ARB", color: "bg-cyan-500" },
  { id: "10", name: "Optimism", symbol: "OP", color: "bg-red-500" },
]

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily", icon: "📅" },
  { value: "weekly", label: "Weekly", icon: "📆" },
  { value: "monthly", label: "Monthly", icon: "🗓️" },
  { value: "quarterly", label: "Quarterly", icon: "📊" },
]

export function PaymentScheduler() {
  const [formData, setFormData] = useState<ScheduleFormData>({
    recipient: "",
    amount: "",
    chain: "",
    frequency: "",
    startDate: undefined,
    endDate: undefined,
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate form
      if (!formData.recipient || !formData.amount || !formData.chain || !formData.frequency || !formData.startDate) {
        throw new Error("Please fill in all required fields")
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setSuccess(true)

      // Reset form after success
      setTimeout(() => {
        setFormData({
          recipient: "",
          amount: "",
          chain: "",
          frequency: "",
          startDate: undefined,
          endDate: undefined,
          description: "",
        })
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule payment")
    } finally {
      setLoading(false)
    }
  }

  const selectedChain = SUPPORTED_CHAINS.find((chain) => chain.id === formData.chain)
  const selectedFrequency = FREQUENCY_OPTIONS.find((freq) => freq.value === formData.frequency)

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-green-400" />
          Payment Scheduler
        </CardTitle>
        <CardDescription className="text-gray-400">Schedule recurring USDC payments across chains</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <AlertDescription className="text-green-400">Payment scheduled successfully! 🎉</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipient" className="text-gray-300">
                Recipient Address *
              </Label>
              <Input
                id="recipient"
                placeholder="0x..."
                value={formData.recipient}
                onChange={(e) => setFormData((prev) => ({ ...prev, recipient: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-300">
                Amount (USDC) *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="100.00"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Target Chain *</Label>
              <Select
                value={formData.chain}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, chain: value }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {SUPPORTED_CHAINS.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id} className="text-white hover:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${chain.color}`} />
                        {chain.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Frequency *</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {FREQUENCY_OPTIONS.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value} className="text-white hover:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <span>{freq.icon}</span>
                        {freq.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData((prev) => ({ ...prev, startDate: date }))}
                    initialFocus
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData((prev) => ({ ...prev, endDate: date }))}
                    initialFocus
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">
              Description (Optional)
            </Label>
            <Input
              id="description"
              placeholder="Monthly salary payment"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          {(selectedChain || selectedFrequency) && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
              <h3 className="text-white font-medium mb-2">Schedule Summary</h3>
              <div className="flex flex-wrap gap-2">
                {selectedChain && (
                  <Badge className="bg-gray-800 text-white border-gray-600">
                    <div className={`w-2 h-2 rounded-full ${selectedChain.color} mr-1`} />
                    {selectedChain.name}
                  </Badge>
                )}
                {selectedFrequency && (
                  <Badge className="bg-gray-800 text-white border-gray-600">
                    <Repeat className="w-3 h-3 mr-1" />
                    {selectedFrequency.label}
                  </Badge>
                )}
                {formData.amount && (
                  <Badge className="bg-gray-800 text-white border-gray-600">
                    <DollarSign className="w-3 h-3 mr-1" />
                    {formData.amount} USDC
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scheduling Payment...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Schedule Payment
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
