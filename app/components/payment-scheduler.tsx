"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, Clock, DollarSign, Send, Plus } from "lucide-react"
import { format } from "date-fns"

interface PaymentSchedule {
  recipient: string
  amount: string
  chain: string
  frequency: string
  startDate: Date | undefined
  endDate: Date | undefined
  description: string
}

const SUPPORTED_CHAINS = [
  { id: "1", name: "Ethereum", symbol: "ETH" },
  { id: "137", name: "Polygon", symbol: "MATIC" },
  { id: "42161", name: "Arbitrum", symbol: "ETH" },
  { id: "10", name: "Optimism", symbol: "ETH" },
  { id: "56", name: "BSC", symbol: "BNB" },
  { id: "43114", name: "Avalanche", symbol: "AVAX" },
]

const FREQUENCY_OPTIONS = [
  { value: "once", label: "One-time" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
]

export function PaymentScheduler() {
  const [schedule, setSchedule] = useState<PaymentSchedule>({
    recipient: "",
    amount: "",
    chain: "",
    frequency: "",
    startDate: undefined,
    endDate: undefined,
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setShowSuccess(true)

    // Reset form after success
    setTimeout(() => {
      setShowSuccess(false)
      setSchedule({
        recipient: "",
        amount: "",
        chain: "",
        frequency: "",
        startDate: undefined,
        endDate: undefined,
        description: "",
      })
    }, 3000)
  }

  const isFormValid =
    schedule.recipient && schedule.amount && schedule.chain && schedule.frequency && schedule.startDate

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Payment Scheduler
        </CardTitle>
        <CardDescription className="text-gray-400">
          Schedule automated USDC payments across multiple chains
        </CardDescription>
      </CardHeader>

      <CardContent>
        {showSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Payment Scheduled!</h3>
            <p className="text-gray-400">
              Your payment has been successfully scheduled and will execute automatically.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipient Address */}
            <div className="space-y-2">
              <Label htmlFor="recipient" className="text-white">
                Recipient Address
              </Label>
              <Input
                id="recipient"
                placeholder="0x..."
                value={schedule.recipient}
                onChange={(e) => setSchedule((prev) => ({ ...prev, recipient: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Amount and Chain */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">
                  Amount (USDC)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="100.00"
                    value={schedule.amount}
                    onChange={(e) => setSchedule((prev) => ({ ...prev, amount: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Chain</Label>
                <Select
                  value={schedule.chain}
                  onValueChange={(value) => setSchedule((prev) => ({ ...prev, chain: value }))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select chain" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {SUPPORTED_CHAINS.map((chain) => (
                      <SelectItem key={chain.id} value={chain.id} className="text-white hover:bg-gray-700">
                        <div className="flex items-center gap-2">
                          <span>{chain.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {chain.symbol}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label className="text-white">Payment Frequency</Label>
              <Select
                value={schedule.frequency}
                onValueChange={(value) => setSchedule((prev) => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {FREQUENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {schedule.startDate ? format(schedule.startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                    <Calendar
                      mode="single"
                      selected={schedule.startDate}
                      onSelect={(date) => setSchedule((prev) => ({ ...prev, startDate: date }))}
                      initialFocus
                      className="text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-white">End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {schedule.endDate ? format(schedule.endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                    <Calendar
                      mode="single"
                      selected={schedule.endDate}
                      onSelect={(date) => setSchedule((prev) => ({ ...prev, endDate: date }))}
                      initialFocus
                      className="text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Payment description..."
                value={schedule.description}
                onChange={(e) => setSchedule((prev) => ({ ...prev, description: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Scheduling Payment...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Payment
                </>
              )}
            </Button>

            {/* Form Preview */}
            {isFormValid && (
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="text-blue-300 font-medium mb-2">Payment Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white">${schedule.amount} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Chain:</span>
                    <span className="text-white">{SUPPORTED_CHAINS.find((c) => c.id === schedule.chain)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Frequency:</span>
                    <span className="text-white">
                      {FREQUENCY_OPTIONS.find((f) => f.value === schedule.frequency)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Start Date:</span>
                    <span className="text-white">
                      {schedule.startDate ? format(schedule.startDate, "MMM dd, yyyy") : ""}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  )
}
