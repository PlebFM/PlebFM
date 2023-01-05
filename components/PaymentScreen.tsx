import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CartIcon, CopyIcon } from '@bitcoin-design/bitcoin-icons-react/filled';
import bokeh2 from '../public/pfm-bokeh-2.jpg';
import { MusicalNoteIcon, QueueListIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import NavBar from './NavBar';
import { Song } from '../models/Song';

function PaymentScreen(props: {
  song: Song;
  readyToCheckout: boolean;
  invoicePaid: boolean;
  setInvoicePaid: Dispatch<SetStateAction<boolean>>;
  totalBid: number;
  bid: number;
}) {
  const [bolt11, setBolt11] = useState({ hash: '', paymentRequest: '' });
  const [loading, setLoading] = useState(false);
  const [startPolling, setStartPolling] = useState(false);

  const getUserProfileFromLocal = () => {
    const userProfileJSON = localStorage.getItem('userProfile');
    if (userProfileJSON) {
      return JSON.parse(userProfileJSON);
    }
  };

  useEffect(() => {
    const getBolt11 = async () => {
      setLoading(true);
      const response = await fetch('/api/invoice', {
        method: 'POST',
        body: JSON.stringify({
          value: props.totalBid,
          memo: `PlebFM - ${props?.song?.name ?? 'Bid'}`,
        }),
      });
      const res = await response.json();
      setBolt11(res);
    };
    getBolt11();
    // console.log(bolt11);
  }, []);

  useEffect(() => {
    if (!startPolling || !bolt11.hash) return;
    const submitBid = async () => {
      const userProfile = getUserProfileFromLocal();
      const response = await fetch(`/api/bid/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostName: 'atl', //TODO FIX
          songId: props.song?.id,
          bidAmount: props.bid,
          rHash: bolt11.hash,
          user: userProfile, // TODO FIX
        }),
      });
      const res = await response.json();
      return res;
    };

    const getPaidStatus = async () => {
      const response = await fetch(`/api/invoice?hash=${bolt11.hash}`);
      const data = await response.json();
      if (data.settled === true) {
        console.log('PAID');
        const bidres = await submitBid();
        console.log('BID RESULT', bidres);
        props.setInvoicePaid(true);
        setStartPolling(false);
      }
      return data;
    };

    const interval = setInterval(async () => {
      console.log('checking paid status...');
      const res = await getPaidStatus();
      console.log('poll', res);
    }, 2000);

    return () => clearInterval(interval);
  }, [startPolling, bolt11.hash]);

  return (
    <>
      <div className="fixed w-full h-full bg-black top-0 left-0 bg-pfm-purple-100">
        {/* <Image src={albumPlaceholder} alt="" width="100" className="object-cover w-full h-full blur-2xl opacity-50" /> */}
        {/* eslint-disable */}
        <img
          src={props?.song?.album?.images[0]?.url ?? bokeh2}
          alt={props?.song?.album?.name ?? 'Album'}
          width={100}
          height={100}
          className="object-cover w-full h-full blur-2xl opacity-50"
        />
      </div>

      <div className=" px-12 pt-12 pb-36 text-white relative z-50 flex flex-col space-y-8 items-center min-h-screen font-thin">
        <div className="w-full">
          <p className="text-xl">{props?.song?.name}</p>
          <p className="text-lg font-bold">{props?.song?.artists[0]?.name}</p>
          <p className="text-base">{props?.song?.album?.name}</p>
        </div>

        <div
          className="bg-white/10 w-[348px] h-[348px] p-[32px] rounded-full flex flex-col space-y-4 justify-center text-center p-8 touch-none relative"
          id="slider"
        >
          {props.readyToCheckout && !props.invoicePaid ? (
            <>
              <CartIcon className="w-24 h-24 mx-auto" />
              <p className="text-xl text-center">
                You’re ready to bid! Copy the invoice and pay from your favorite
                bitcoin wallet.
              </p>
            </>
          ) : props.readyToCheckout && props.invoicePaid ? (
            <>
              <MusicalNoteIcon className="w-24 h-24 mx-auto" />
              <p className="text-xl text-center">All paid! Let’s jam.</p>
            </>
          ) : (
            ``
          )}
        </div>

        {props.readyToCheckout && !props.invoicePaid ? (
          <CopyToClipboard
            text={bolt11.paymentRequest}
            onCopy={() => setStartPolling(true)}
          >
            <Button className="w-full" icon={<CopyIcon />} size="small">
              Copy Invoice
            </Button>
          </CopyToClipboard>
        ) : props.readyToCheckout && props.invoicePaid ? (
          <Button
            className="w-full"
            icon={<QueueListIcon />}
            href="/atl/queue"
            size="small"
          >
            Song Queue
          </Button>
        ) : (
          ``
        )}
      </div>
      <NavBar />
    </>
  );
}
export default PaymentScreen;
