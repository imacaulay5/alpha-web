'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getInvoices, createInvoice, updateInvoice, deleteInvoice, generateInvoiceNumber } from '@/services/invoices.service'
import { getClients } from '@/services/clients.service'
import type { Invoice, Client } from '@/types/models'
import { InvoiceStatus, invoiceStatusLabels } from '@/types/enums'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Pencil, Trash2, Loader2, DollarSign, Send } from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO, addDays } from 'date-fns'

function getStatusVariant(status: InvoiceStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case InvoiceStatus.paid:
      return 'default'
    case InvoiceStatus.sent:
      return 'secondary'
    case InvoiceStatus.overdue:
      return 'destructive'
    case InvoiceStatus.cancelled:
      return 'outline'
    default:
      return 'secondary'
  }
}

interface LineItem {
  description: string
  quantity: number
  rate: number
  amount: number
}

export default function InvoicesPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    client_id: '',
    invoice_number: '',
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    tax_rate: '0',
    notes: '',
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, rate: 0, amount: 0 }
  ])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setError(null)
      const [invoicesData, clientsData] = await Promise.all([
        getInvoices(),
        getClients(),
      ])
      setInvoices(invoicesData)
      setClients(clientsData)
    } catch (err) {
      console.error('Failed to load invoices data:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = async () => {
    setSelectedInvoice(null)
    const invoiceNumber = await generateInvoiceNumber()
    setFormData({
      client_id: '',
      invoice_number: invoiceNumber,
      issue_date: format(new Date(), 'yyyy-MM-dd'),
      due_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      tax_rate: '0',
      notes: '',
    })
    setLineItems([{ description: '', quantity: 1, rate: 0, amount: 0 }])
    setDialogOpen(true)
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }

    // Recalculate amount
    if (field === 'quantity' || field === 'rate') {
      updated[index].amount = updated[index].quantity * updated[index].rate
    }

    setLineItems(updated)
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0, amount: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
    const taxRate = parseFloat(formData.tax_rate) || 0
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount
    return { subtotal, taxAmount, total }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { subtotal, taxAmount, total } = calculateTotals()

      const invoiceData = {
        user_id: user?.id,
        organization_id: user?.organization_id,
        client_id: formData.client_id || undefined,
        invoice_number: formData.invoice_number,
        issue_date: formData.issue_date,
        due_date: formData.due_date,
        subtotal,
        tax_rate: parseFloat(formData.tax_rate) || 0,
        tax_amount: taxAmount,
        total,
        currency: 'USD',
        status: InvoiceStatus.draft,
        notes: formData.notes || undefined,
      }

      const lineItemsData = lineItems
        .filter(item => item.description)
        .map((item, index) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          order: index,
        }))

      if (selectedInvoice) {
        await updateInvoice(selectedInvoice.id, invoiceData)
        toast.success('Invoice updated')
      } else {
        await createInvoice(invoiceData as any, lineItemsData)
        toast.success('Invoice created')
      }
      setDialogOpen(false)
      loadData()
    } catch (error) {
      toast.error('Failed to save invoice')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedInvoice) return

    try {
      await deleteInvoice(selectedInvoice.id)
      toast.success('Invoice deleted')
      setDeleteDialogOpen(false)
      setSelectedInvoice(null)
      loadData()
    } catch (error) {
      toast.error('Failed to delete invoice')
    }
  }

  const handleStatusChange = async (invoice: Invoice, newStatus: InvoiceStatus) => {
    try {
      await updateInvoice(invoice.id, { status: newStatus })
      toast.success('Invoice status updated')
      loadData()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  // Calculate totals
  const totalOutstanding = invoices
    .filter(i => i.status === InvoiceStatus.sent || i.status === InvoiceStatus.overdue)
    .reduce((sum, i) => sum + i.total, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-destructive opacity-50" />
            <p className="text-destructive font-medium">Error loading data</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button onClick={loadData} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Create and manage your invoices</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          New Invoice
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalOutstanding.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.filter(i => i.status === InvoiceStatus.draft).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {invoices.filter(i => i.status === InvoiceStatus.overdue).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No invoices yet</p>
            <p className="text-sm text-muted-foreground">Create your first invoice to get started</p>
            <Button onClick={openCreateDialog} className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              New Invoice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              All Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.client?.name || '-'}</TableCell>
                    <TableCell>{format(parseISO(invoice.issue_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{format(parseISO(invoice.due_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right font-medium">
                      <span className="flex items-center justify-end gap-1">
                        <DollarSign className="w-3 h-3" />
                        {invoice.total.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(invoice.status)}>
                        {invoiceStatusLabels[invoice.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.status === InvoiceStatus.draft && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStatusChange(invoice, InvoiceStatus.sent)}
                          title="Mark as Sent"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedInvoice(invoice)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Invoice</DialogTitle>
            <DialogDescription>Create a new invoice for your client</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice_number">Invoice Number</Label>
                  <Input
                    id="invoice_number"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issue_date">Issue Date</Label>
                  <Input
                    id="issue_date"
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.01"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <Label>Line Items</Label>
                <div className="border rounded-lg p-4 space-y-2">
                  {lineItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <Input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Rate"
                          value={item.rate}
                          onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2 text-right font-medium py-2">
                        ${item.amount.toFixed(2)}
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(index)}
                          disabled={lineItems.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                    <Plus className="w-4 h-4 mr-2" /> Add Line
                  </Button>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({formData.tax_rate}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Payment terms, thank you message, etc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice {selectedInvoice?.invoice_number}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
