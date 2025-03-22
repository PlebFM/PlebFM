import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  console.log('Billing history API called');
  try {
    const session = await auth();
    console.log(
      'Auth session:',
      session?.user ? 'User authenticated' : 'No user',
    );

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters for pagination and filtering
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const startingAfter = searchParams.get('startingAfter') || undefined;
    const status = searchParams.get('status') || 'all';

    // Get user's Stripe customer ID
    const user = session.user as { stripeCustomerId?: string };
    console.log('User info:', JSON.stringify(user, null, 2));
    console.log('Stripe customer ID present:', !!user.stripeCustomerId);

    // If no customer ID, return empty array
    if (!user.stripeCustomerId) {
      console.log('No Stripe customer ID, returning empty invoices array');
      return NextResponse.json({
        invoices: [],
        hasMore: false,
        lastInvoiceId: null,
      });
    }

    // Build filter for invoice status
    const filterOptions: Stripe.InvoiceListParams = {
      customer: user.stripeCustomerId,
      limit: limit,
      expand: ['data.charge', 'data.payment_intent'],
    };

    if (startingAfter) {
      filterOptions.starting_after = startingAfter;
    }

    if (status !== 'all') {
      filterOptions.status = status as Stripe.InvoiceListParams.Status;
    }

    // Fetch invoices from Stripe
    console.log(
      'Fetching invoices with options:',
      JSON.stringify(filterOptions, null, 2),
    );
    const invoices = await stripe.invoices.list(filterOptions);
    console.log(`Got ${invoices.data.length} invoices from Stripe`);

    // Format invoice data for frontend
    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      date: new Date(invoice.created * 1000).toISOString(),
      formattedDate: new Date(invoice.created * 1000).toLocaleDateString(
        'en-US',
        { year: 'numeric', month: 'short', day: 'numeric' },
      ),
      amount: invoice.total,
      formattedAmount: (invoice.total / 100).toFixed(2),
      status: invoice.status,
      description: invoice.lines.data[0]?.description || 'Subscription Payment',
      periodStart: invoice.period_start
        ? new Date(invoice.period_start * 1000).toLocaleDateString()
        : null,
      periodEnd: invoice.period_end
        ? new Date(invoice.period_end * 1000).toLocaleDateString()
        : null,
      receiptUrl: invoice.hosted_invoice_url,
      pdfUrl: invoice.invoice_pdf,
      paymentMethod: invoice.payment_intent
        ? (invoice.payment_intent as any)?.payment_method_types?.[0] || 'card'
        : 'unknown',
    }));

    // Return formatted real invoices
    return NextResponse.json({
      invoices: formattedInvoices,
      hasMore: invoices.has_more,
      lastInvoiceId:
        invoices.data.length > 0
          ? invoices.data[invoices.data.length - 1].id
          : null,
    });
  } catch (error) {
    console.error('Error fetching billing history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing history' },
      { status: 500 },
    );
  }
}
