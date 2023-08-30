import { QRCodeSVG } from 'qrcode.react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CartIcon, CopyIcon } from '@bitcoin-design/bitcoin-icons-react/filled';
import bokeh2 from '../../public/pfm-bokeh-2.jpg';
import { MusicalNoteIcon, QueueListIcon } from '@heroicons/react/24/outline';
import Button from '../Button';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import NavBar from '../NavBar';
import { Song } from '../../models/Song';
import { usePathname } from 'next/navigation';
import LoadingSpinner, { Spinner } from '../LoadingSpinner';
import { CheckoutHeader } from './CheckoutHeader';

function PaymentScreen(props: {
  song: Song;
  readyToCheckout: boolean;
  invoicePaid: boolean;
  setInvoicePaid: Dispatch<SetStateAction<boolean>>;
  totalBid: number;
  bid: number;
}) {
  const [bolt11, setBolt11] = useState({ hash: '', paymentRequest: '' });
  const [loading, setLoading] = useState(true);
  const [startPolling, setStartPolling] = useState(false);
  const pathname = usePathname();

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: props.totalBid,
          memo: `PlebFM - ${props?.song?.name ?? 'Bid'}`,
          shortName: 'atl',
        }),
      });
      const res = await response.json();
      setBolt11({
        hash: res.payment_hash,
        paymentRequest: res.payment_request,
      });
      setLoading(false);
    };
    getBolt11();
    // console.log(bolt11);
  }, []);

  useEffect(() => {
    if (!startPolling || !bolt11.hash || !pathname) return;

    const getPaidStatus = async () => {
      const hostId = pathname?.substring(1); // /atl -> atl
      const user = getUserProfileFromLocal();
      const url = `/api/invoice?hash=${bolt11.hash}&hostId=${hostId}&songId=${props.song?.id}&bidAmount=${props.totalBid}&userId=${user.userId}&shortName=${hostId}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.settled === true) {
        console.log('PAID');
        // const bidres = await submitBid();
        // console.log('BID RESULT', bidres);
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
  }, [startPolling, bolt11.hash, pathname]);

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

      <div className="relative mx-auto inset-x-0 max-w-xl px-12 pt-12 pb-36 text-white z-50 flex flex-col space-y-8 items-center min-h-screen font-thin">
        <CheckoutHeader song={props?.song} />
        {loading ? (
          <div className="w-full h-full flex justify-center items-center pt-20">
            <Spinner />
          </div>
        ) : (
          <>
            <div
              className="bg-white/10 w-[290px] h-[290px] p-[32px] rounded-full flex flex-col space-y-4 justify-center text-center p-8 touch-none relative"
              id="slider"
            >
              {props.readyToCheckout && !props.invoicePaid ? (
                <>
                  <CartIcon className="w-24 h-24 mx-auto" />
                  <p className="text-lg text-center">
                    You’re ready to bid! Copy the invoice and pay from your
                    favorite bitcoin wallet.
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
              <div className="flex flex-col m-auto justify-items-center items-center gap-4">
                {loading ? (
                  <div className="w-full h-full flex justify-center items-center">
                    <Spinner />
                  </div>
                ) : (
                  <>
                    <QRCodeSVG
                      value={bolt11.paymentRequest}
                      width={'200px'}
                      height={'200px'}
                      includeMargin={true}
                    />
                    <CopyToClipboard
                      text={bolt11.paymentRequest}
                      onCopy={() => setStartPolling(true)}
                    >
                      <Button
                        className="w-full text-sm"
                        icon={<CopyIcon />}
                        size="small"
                      >
                        Copy Invoice
                      </Button>
                    </CopyToClipboard>
                  </>
                )}
              </div>
            ) : props.readyToCheckout && props.invoicePaid ? (
              <Button
                className="w-full"
                icon={<QueueListIcon />}
                href={`${pathname}/queue`}
                size="small"
              >
                Song Queue
              </Button>
            ) : (
              ``
            )}
          </>
        )}
      </div>

      <NavBar activeBtn="search" />
    </>
  );
}
export default PaymentScreen;
