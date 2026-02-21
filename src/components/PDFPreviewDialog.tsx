'use client'

import { useState } from 'react'
import { PDFViewer, pdf } from '@react-pdf/renderer'
import { InvoicePDF } from './InvoicePDF'
import type { Invoice, Organization } from '@/types/models'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'
import { toast } from 'sonner'

interface PDFPreviewDialogProps {
  invoice: Invoice
  organization?: Organization | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PDFPreviewDialog({
  invoice,
  organization,
  open,
  onOpenChange,
}: PDFPreviewDialogProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = await pdf(
        <InvoicePDF invoice={invoice} organization={organization} />
      ).toBlob()
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
      setDownloading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b shrink-0">
          <DialogTitle>Invoice {invoice.invoice_number}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button onClick={handleDownload} disabled={downloading} size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              {downloading ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <PDFViewer width="100%" height="100%" showToolbar={false}>
            <InvoicePDF invoice={invoice} organization={organization} />
          </PDFViewer>
        </div>
      </DialogContent>
    </Dialog>
  )
}
