import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  decidePollOutcome,
  decideRecovery,
  InvoiceStatusBody,
  isTransientFailure,
  NETWORK_FAILURE,
  PaymentFailureReason,
  POLL_INTERVAL_MS,
} from '../../lib/payments/polling';
import { Song } from '../../models/Song';
import { getUserProfileFromLocal } from '../../utils/profile';

export type { PaymentFailureReason };

export type PaymentFailure = {
  reason: PaymentFailureReason;
  message: string;
};

/** What the payer is told. The server's own `error` text is preferred when it
 *  says something more specific than these. */
const FAILURE_MESSAGES: Record<PaymentFailureReason, string> = {
  expired: 'This invoice expired before it was paid.',
  invalid: 'We could not verify this invoice.',
  unavailable: 'We could not reach the payment service.',
  mint: 'We could not create an invoice.',
};

const failure = (
  reason: PaymentFailureReason,
  body?: InvoiceStatusBody | null,
): PaymentFailure => ({
  reason,
  message: body?.error ?? FAILURE_MESSAGES[reason],
});

export const usePayment = (
  song: Song,
  totalBid: number,
  onPaid: () => void,
) => {
  const [loading, setLoading] = useState(true);
  const [bolt11, setBolt11] = useState({
    hash: '',
    paymentRequest: '',
    statusRef: '',
  });
  const [paymentFailure, setPaymentFailure] = useState<PaymentFailure | null>(
    null,
  );
  const [attempt, setAttempt] = useState(0);
  const [pollEpoch, setPollEpoch] = useState(0);
  const pathname = usePathname();

  // Held in a ref so a parent that passes a fresh closure each render does not
  // tear down and restart the poll loop underneath a payer.
  const onPaidRef = useRef(onPaid);
  onPaidRef.current = onPaid;

  /**
   * Recover from a failure the payer was shown.
   *
   * Only mints a replacement invoice when the current one cannot settle. If the
   * *server* was what failed, the invoice is still live and may already have
   * been paid, so this resumes polling it rather than issuing a second invoice
   * for the same bid — otherwise a transient outage can cost the payer a
   * duplicate payment and lose the first one.
   */
  const retry = useCallback(() => {
    const reason = paymentFailure?.reason;
    if (reason && decideRecovery(reason) === 'resume') {
      setPaymentFailure(null);
      setPollEpoch(current => current + 1);
      return;
    }
    setAttempt(current => current + 1);
  }, [paymentFailure?.reason]);

  useEffect(() => {
    let cancelled = false;

    const mint = async () => {
      setLoading(true);
      setPaymentFailure(null);
      const hostId = pathname?.substring(1) ?? 'atl'; // /atl -> atl

      let ok = false;
      // Either the minted invoice or, on failure, the shared error body.
      let res:
        | (InvoiceStatusBody & {
            payment_request?: string;
            payment_hash?: string;
            status_ref?: string;
          })
        | null = null;
      try {
        const response = await fetch('/api/invoice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            value: totalBid,
            memo: `PlebFM - ${song.name ?? 'Bid'}`,
            shortName: hostId,
          }),
        });
        ok = response.ok;
        res = await response.json().catch(() => null);
      } catch (e) {
        console.error('Failed to reach /api/invoice', e);
      }

      if (cancelled) return;
      setLoading(false);

      // A failed mint used to still start the poller, which then hammered
      // /api/invoice every 2s against an invoice that does not exist.
      if (!ok || !res?.payment_request || !res?.payment_hash) {
        console.error('Failed to create invoice', res);
        setPaymentFailure(failure('mint', res));
        return;
      }

      setBolt11({
        hash: res.payment_hash,
        paymentRequest: res.payment_request,
        // Both carry the server's signed invoice reference.
        statusRef: res.status_ref ?? res.payment_hash,
      });
    };

    mint();
    return () => {
      cancelled = true;
    };
  }, [attempt, pathname, song.name, totalBid]);

  useEffect(() => {
    if (!bolt11.statusRef) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let consecutiveFailures = 0;

    const checkStatus = async () => {
      const hostId = pathname?.substring(1); // /atl -> atl
      const user = getUserProfileFromLocal();
      const url = `/api/invoice?hash=${encodeURIComponent(
        bolt11.hash,
      )}&ref=${encodeURIComponent(bolt11.statusRef)}&hostId=${hostId}&songId=${
        song.id
      }&bidAmount=${totalBid}&userId=${user.userId}&shortName=${hostId}`;

      // A request that never lands is reported as a failure to poll on, not as
      // an exception that silently kills the loop with no UI to show for it.
      let httpStatus = NETWORK_FAILURE;
      let body: InvoiceStatusBody | null = null;
      try {
        const response = await fetch(url);
        httpStatus = response.status;
        body = await response.json().catch(() => null);
      } catch (e) {
        console.error('Invoice status check failed', e);
      }

      if (cancelled) return;

      // Count this answer before judging it, so the budget is spent on the
      // fifth consecutive failure rather than the sixth.
      consecutiveFailures = isTransientFailure(httpStatus)
        ? consecutiveFailures + 1
        : 0;

      const outcome = decidePollOutcome(httpStatus, body, consecutiveFailures);
      if (outcome.action === 'paid') {
        console.log('PAID');
        onPaidRef.current();
        return;
      }
      // Expired, rejected, or repeatedly unreachable: this invoice is never
      // going to settle, so stop asking and give the payer something to do.
      if (outcome.action === 'stop') {
        setPaymentFailure(failure(outcome.reason, body));
        return;
      }

      timeoutId = setTimeout(checkStatus, POLL_INTERVAL_MS);
    };

    checkStatus();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
    // `pollEpoch` restarts polling the *same* invoice after a resume.
  }, [bolt11.hash, bolt11.statusRef, pathname, pollEpoch, song.id, totalBid]);

  return {
    loading,
    bolt11,
    paymentFailure,
    retry,
  };
};
