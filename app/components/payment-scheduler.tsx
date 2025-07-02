"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, DollarSign, User, Loader2 } from "lucide-react"

export function PaymentScheduler() {
  const [formData, setFormData] = useState({
    recipient: "",
    amount: "",
    interval: "",
    startDate: "",
    description: "",
  })
  const [isScheduling, setIsScheduling] = useState(false)
  const [scheduledPayment, setScheduledPayment] = useState(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSchedulePayment = async () => {
    setIsScheduling(true)
    try {
      // Simulate API call to schedule payment
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const payment = {
        id: Date.now(),
        ...formData,
        status: "scheduled",
        createdAt: new Date().toISOString(),
      }

      setScheduledPayment(payment)

      // Reset form
      setFormData({
        recipient: "",
        amount: "",
        interval: "",
        startDate: "",
        description: "",
      })
    } finally {
      setIsScheduling(false)
    }
  }

  const isFormValid = formData.recipient && formData.amount && formData.interval && formData.startDate

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Schedule Payment
          </CardTitle>
          <CardDescription>Set up recurring USDC payments with automatic fee optimization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Recipient Address
            </Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={formData.recipient}
              onChange={(e) => handleInputChange("recipient", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Amount (USDC)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="100"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval">Payment Interval</Label>
            <Select value={formData.interval} onValueChange={(value) => handleInputChange("interval", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Start Date
            </Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Monthly salary payment"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </div>

          <Button onClick={handleSchedulePayment} disabled={!isFormValid || isScheduling} className="w-full">
            {isScheduling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              "Schedule Payment"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Preview</CardTitle>
          <CardDescription>Review your scheduled payment details</CardDescription>
        </CardHeader>
        <CardContent>
          {scheduledPayment ? (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>Payment scheduled successfully! ID: {scheduledPayment.id}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Recipient:</span>
                <span className="font-mono">{formData.recipient || "Not set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span>{formData.amount || "0"} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interval:</span>
                <span className="capitalize">{formData.interval || "Not set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date:</span>
                <span>{formData.startDate ? new Date(formData.startDate).toLocaleDateString() : "Not set"}</span>
              </div>
              {formData.description && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span>{formData.description}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
