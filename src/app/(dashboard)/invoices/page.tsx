'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/contexts/AuthContext'
import { useAppState } from '@/contexts/AppStateContext'
import { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, generateInvoiceNumber } from '@/services/invoices.service'
import { getClients } from '@/services/clients.service'
import type { Invoice, Client, CreateInvoiceInput, CreateInvoiceLineItemInput } from '@/types/models'
import { AccountType, InvoiceStatus, invoiceStatusLabels } from '@/types/enums'

// Load PDF utilities client-side only (react-pdf doesn't support SSR)
const PDFPreviewDialog = dynamic(() => import('@/components/PDFPreviewDialog'), { ssr: false })
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
import { Plus, FileText, Pencil, Trash2, Loader2, DollarSign, Send, Download, Eye, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import { format, addDays } from 'date-fns'
import { formatDateOnly } from '@/lib/date-format'
import { canDraftInvoiceReminder, captureInvoiceLineFromText, draftInvoiceReminder, type InvoiceReminderDraft } from '@/lib/invoice-ai'

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
  const { organization } = useAppState()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [saving, setSaving] = useState(false)
  const [pdfInvoice, setPdfInvoice] = useState<Invoice | null>(null)
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null)
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
  const [reminderInvoice, setReminderInvoice] = useState<Invoice | null>(null)
  const [reminderDraft, setReminderDraft] = useState<InvoiceReminderDraft | null>(null)
  const [lineCaptureText, setLineCaptureText] = useState('')
  const [lineCaptureSummary, setLineCaptureSummary] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    client_id: '',
    invoice_number: '',
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    tax_rate: '0',
    notes: '',
  })

  const isCreateMode = !selectedInvoice

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, rate: 0, amount: 0 }
  ])

  useEffect(() => {
    if (user) loadData()
  }, [user?.id, user?.organization_id])

  const loadData = async () => {
    try {
      setError(null)
      const [invoicesData, clientsData] = await Promise.all([
        getInvoices({
          userId: user?.id,
          organizationId: user?.organization_id,
        }),
        getClients({
          userId: user?.id,
          organizationId: user?.organization_id,
        }),
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
    setLineCaptureText('')
    setLineCaptureSummary(null)
    setDialogOpen(true)
  }

  const openEditDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setFormData({
      client_id: invoice.client_id || '',
      invoice_number: invoice.invoice_number || '',
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      tax_rate: String(invoice.tax_rate ?? 0),
      notes: invoice.notes || '',
    })
    setLineItems(
      invoice.line_items?.length
        ? invoice.line_items
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((item) => ({
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.amount,
            }))
        : [{ description: '', quantity: 1, rate: 0, amount: 0 }]
    )
    setLineCaptureText('')
    setLineCaptureSummary(null)
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

  const handleLineCapture = () => {
    const captured = captureInvoiceLineFromText(lineCaptureText)
    const nextLine = {
      description: captured.description,
      quantity: captured.quantity,
      rate: captured.rate,
      amount: captured.amount,
    }
    const hasOnlyEmptyLine =
      lineItems.length === 1 &&
      !lineItems[0].description &&
      lineItems[0].quantity === 1 &&
      lineItems[0].rate === 0

    setLineItems(hasOnlyEmptyLine ? [nextLine] : [...lineItems, nextLine])
    setLineCaptureSummary(captured.reason)
  }

  const calculateTotals = (taxRateOverride?: number) => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
    const taxRate = taxRateOverride ?? (parseFloat(formData.tax_rate) || 0)
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount
    return { subtotal, taxAmount, total }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const submitted = new FormData(e.currentTarget as HTMLFormElement)
      const invoiceNumber = String(submitted.get('invoice_number') || formData.invoice_number)
      const issueDate = String(submitted.get('issue_date') || formData.issue_date)
      const dueDate = String(submitted.get('due_date') || formData.due_date)
      const taxRate = parseFloat(String(submitted.get('tax_rate') || formData.tax_rate)) || 0
      const notes = String(submitted.get('notes') || formData.notes)

      if (!formData.client_id) {
        toast.error('Select a client before creating an invoice')
        return
      }

      const { subtotal, taxAmount, total } = calculateTotals(taxRate)

      const invoiceData: CreateInvoiceInput = {
        user_id: user?.account_type === AccountType.business ? undefined : user?.id,
        organization_id: user?.organization_id,
        client_id: formData.client_id,
        invoice_number: invoiceNumber.trim() || undefined,
        issue_date: issueDate,
        due_date: dueDate,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        currency: 'USD',
        status: InvoiceStatus.draft,
        notes: notes || undefined,
      }

      const lineItemsData: Omit<CreateInvoiceLineItemInput, 'invoice_id'>[] = lineItems
        .filter(item => item.description)
        .map((item, index) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          order: index,
        }))

      if (selectedInvoice) {
        await updateInvoice(selectedInvoice.id, {
          ...invoiceData,
          invoice_number: invoiceNumber.trim() || undefined,
        })
        toast.success('Invoice updated')
      } else {
        await createInvoice(invoiceData, lineItemsData)
        toast.success('Invoice created')
      }
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('Failed to save invoice:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save invoice')
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

  const openPdfPreview = async (invoice: Invoice) => {
    setLoadingPdf(invoice.id)
    try {
      const full = await getInvoice(invoice.id)
      setPdfInvoice(full)
      setPdfPreviewOpen(true)
    } catch {
      toast.error('Failed to load invoice details')
    } finally {
      setLoadingPdf(null)
    }
  }

  const handleDownloadPdf = async (invoice: Invoice) => {
    setLoadingPdf(invoice.id)
    try {
      const full = await getInvoice(invoice.id)
      if (!full) return
      const { pdf } = await import('@react-pdf/renderer')
      const { InvoicePDF } = await import('@/components/InvoicePDF')
      const blob = await pdf(<InvoicePDF invoice={full} organization={organization} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoice.invoice_number}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF downloaded')
    } catch {
      toast.error('Failed to generate PDF')
    } finally {
      setLoadingPdf(null)
    }
  }

  const openReminderDraft = (invoice: Invoice) => {
    setReminderInvoice(invoice)
    setReminderDraft(draftInvoiceReminder(invoice))
    setReminderDialogOpen(true)
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
                    <TableCell>{formatDateOnly(invoice.issue_date)}</TableCell>
                    <TableCell>{formatDateOnly(invoice.due_date)}</TableCell>
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
                      {canDraftInvoiceReminder(invoice) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openReminderDraft(invoice)}
                          title="Draft Reminder"
                        >
                          <Wand2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openPdfPreview(invoice)}
                        title="Preview PDF"
                        disabled={loadingPdf === invoice.id}
                      >
                        {loadingPdf === invoice.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Eye className="w-4 h-4" />
                        }
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadPdf(invoice)}
                        title="Download PDF"
                        disabled={loadingPdf === invoice.id}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(invoice)}
                        title="Edit Invoice"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
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
            <DialogTitle>{isCreateMode ? 'New Invoice' : 'Edit Invoice'}</DialogTitle>
            <DialogDescription>
              {isCreateMode ? 'Create a new invoice for your client' : 'Update invoice details'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice_number">Invoice Number</Label>
                  <Input
                    id="invoice_number"
                    name="invoice_number"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    required={!isCreateMode}
                    placeholder={isCreateMode ? 'Leave blank to let the server assign it' : undefined}
                  />
                  {isCreateMode && (
                    <p className="text-xs text-muted-foreground">Optional on create — the server can assign the invoice number.</p>
                  )}
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
                      {clients.length === 0 ? (
                        <SelectItem value="__no_clients__" disabled>
                          No clients available
                        </SelectItem>
                      ) : clients.map((client) => (
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
                    name="issue_date"
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
                    name="due_date"
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
                    name="tax_rate"
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
                  {isCreateMode && (
                    <div className="mb-4 rounded-lg border bg-primary/5 p-3">
                      <div className="mb-3 flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Wand2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Smart line capture</p>
                          <p className="text-sm text-muted-foreground">
                            Describe the work and Alpha will add an invoice line.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Textarea
                          value={lineCaptureText}
                          onChange={(e) => {
                            setLineCaptureText(e.target.value)
                            setLineCaptureSummary(null)
                          }}
                          placeholder="Example: Design work 12 hours at 90"
                          rows={2}
                        />
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-muted-foreground">
                            {lineCaptureSummary || 'Alpha looks for description, hours, and rate.'}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleLineCapture}
                            disabled={!lineCaptureText.trim()}
                            className="shrink-0 gap-2"
                          >
                            <Wand2 className="h-4 w-4" />
                            Add smart line
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
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
                  name="notes"
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
                {isCreateMode ? 'Create Invoice' : 'Save Changes'}
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

      {/* PDF Preview */}
      {pdfPreviewOpen && pdfInvoice && (
        <PDFPreviewDialog
          invoice={pdfInvoice}
          organization={organization}
          open={pdfPreviewOpen}
          onOpenChange={setPdfPreviewOpen}
        />
      )}

      {/* AI Reminder Draft */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Payment Reminder Draft
            </DialogTitle>
            <DialogDescription>
              Review and edit this message before sending it outside Alpha.
            </DialogDescription>
          </DialogHeader>
          {reminderDraft && reminderInvoice && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border bg-primary/5 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={reminderDraft.tone === 'firm' ? 'destructive' : 'secondary'}>
                    {reminderDraft.tone}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{reminderDraft.reason}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder_subject">Subject</Label>
                <Input
                  id="reminder_subject"
                  value={reminderDraft.subject}
                  onChange={(e) => setReminderDraft({ ...reminderDraft, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder_body">Message</Label>
                <Textarea
                  id="reminder_body"
                  value={reminderDraft.body}
                  onChange={(e) => setReminderDraft({ ...reminderDraft, body: e.target.value })}
                  rows={8}
                />
              </div>
              <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                Invoice {reminderInvoice.invoice_number} · {reminderInvoice.client?.name || 'No client'} · ${reminderInvoice.total.toFixed(2)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setReminderDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
