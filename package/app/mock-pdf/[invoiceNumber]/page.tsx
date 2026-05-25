import Link from "next/link";
import { notFound } from "next/navigation";
import { mockInvoices } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

type InvoicePreviewPageProps = {
  params: Promise<{
    invoiceNumber: string;
  }>;
};

function normalizeInvoiceNumber(invoiceNumber: string): string {
  const decoded = decodeURIComponent(invoiceNumber);
  return decoded.endsWith(".pdf") ? decoded.slice(0, -4) : decoded;
}

export default async function InvoicePreviewPage({ params }: InvoicePreviewPageProps) {
  const { invoiceNumber: rawInvoiceNumber } = await params;
  const invoiceNumber = normalizeInvoiceNumber(rawInvoiceNumber);
  const invoice = mockInvoices.find((entry) => entry.invoiceNumber === invoiceNumber);

  if (!invoice) {
    notFound();
  }

  return (
    <main className="invoice-preview-page">
      <section className="invoice-preview-card">
        <header className="invoice-preview-header">
          <div>
            <p className="invoice-kicker">Surviving My Multiples</p>
            <h1>Invoice Preview</h1>
            <p className="invoice-muted">Mock PDF rendering for billing history</p>
          </div>
          <div className="invoice-header-actions">
            <Link className="ghost-btn" href="/settings">
              Back to Settings
            </Link>
            <span className="save-note">Use browser print for PDF export</span>
          </div>
        </header>

        <section className="invoice-meta-grid">
          <div>
            <p className="invoice-meta-label">Invoice Number</p>
            <p className="invoice-meta-value">{invoice.invoiceNumber}</p>
          </div>
          <div>
            <p className="invoice-meta-label">Status</p>
            <p className="invoice-meta-value">{invoice.status}</p>
          </div>
          <div>
            <p className="invoice-meta-label">Invoice Date</p>
            <p className="invoice-meta-value">{invoice.date}</p>
          </div>
          <div>
            <p className="invoice-meta-label">Amount Due</p>
            <p className="invoice-meta-value">{invoice.amount}</p>
          </div>
        </section>

        <section className="invoice-addresses">
          <div>
            <h2>Bill To</h2>
            <p>The Johnson Crew</p>
            <p>support@survivingmymultiples.com</p>
          </div>
          <div>
            <h2>From</h2>
            <p>Surviving My Multiples</p>
            <p>billing@survivingmymultiples.com</p>
          </div>
        </section>

        <section className="invoice-lines">
          <div className="invoice-line invoice-line-header">
            <span>Description</span>
            <span>Qty</span>
            <span>Unit</span>
            <span>Total</span>
          </div>
          <div className="invoice-line">
            <span>{invoice.description}</span>
            <span>1</span>
            <span>{invoice.amount}</span>
            <span>{invoice.amount}</span>
          </div>
          <div className="invoice-line">
            <span>Family collaboration seats</span>
            <span>3</span>
            <span>$0.00</span>
            <span>$0.00</span>
          </div>
        </section>

        <section className="invoice-totals">
          <div className="invoice-total-row">
            <span>Subtotal</span>
            <strong>{invoice.amount}</strong>
          </div>
          <div className="invoice-total-row">
            <span>Tax</span>
            <strong>$0.00</strong>
          </div>
          <div className="invoice-total-row grand-total">
            <span>Total</span>
            <strong>{invoice.amount}</strong>
          </div>
        </section>

        <footer className="invoice-footer">
          <p>This is a mock invoice preview page for UI demonstration and testing.</p>
        </footer>
      </section>
    </main>
  );
}
