"use client"
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { CartIcon, CopyIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import bokeh2 from "../../public/pfm-bokeh-2.jpg"
import { MusicalNoteIcon, QueueListIcon } from "@heroicons/react/24/outline";
import Button from "../../components/Button";
import { useEffect, useState } from "react";

function PaymentScreen(props: {song, readyToCheckout, invoicePaid, setInvoicePaid, totalBid}) {
  const [bolt11, setBolt11] = useState({ hash: '', paymentRequest: '', });
  const [isPaid, setIsPaid] = useState(false);

  async function copyTextToClipboard(text: string) {
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand('copy', true, text);
    }
  }


  useEffect(() => {
    const getBolt11 = async () => {
      const response = await fetch('/api/invoice', {
        method: 'POST',
        body: JSON.stringify({ value: props.totalBid, memo: `PlebFM - ${props?.song?.name ?? "Bid"}` }),
      });

      console.log(await response.json());
    }
    getBolt11();
    // console.log(bolt11);
  }, [bolt11]);

  useEffect(() => {
    const getPaidStatus = async () => {
      const response = await fetch(`/api/invoice?hash=${bolt11.hash}`);
      const data = await response.json();
      if (data.settled === true) setIsPaid(true);
    };

    if (bolt11.hash) {
      const interval = setInterval(() => {
        console.log("checking paid status...");
        getPaidStatus();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [bolt11]);

  return (
    <>
      <div className="fixed w-full h-full bg-black top-0 left-0 bg-pfm-purple-100">
        {/* <Image src={albumPlaceholder} alt="" width="100" className="object-cover w-full h-full blur-2xl opacity-50" /> */}
        { /* eslint-disable */}
        <img 
          src={props?.song?.album?.images[0]?.url ?? bokeh2} 
          alt={props?.song?.album?.name ?? "Album"} 
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
          {props.readyToCheckout && !props.invoicePaid ?
            <>
              <CartIcon className="w-24 h-24 mx-auto" />
              <p className="text-xl text-center">
                You’re ready to bid! Copy the invoice and pay from your favorite bitcoin wallet.
              </p>
            </>
          : props.readyToCheckout && props.invoicePaid ?
            <>
              <MusicalNoteIcon className="w-24 h-24 mx-auto" />
              <p className="text-xl text-center">
                All paid! Let’s jam.
              </p>
            </>
          : `` }
        </div>

        {props.readyToCheckout && !props.invoicePaid ?
          <CopyToClipboard 
            text={bolt11.paymentRequest}
            onCopy={() => {alert('copied')}}
          >
            <Button
              className="w-full"
              icon={<CopyIcon />}
              // onClick={()=> {
              //   // props.setInvoicePaid(true);
              //   const res = copyTextToClipboard(bolt11.paymentRequest);
              //   res.then(x => {

              //     console.log('COPY RES', x); 
              //   })
              // }}
              size="small"
            >
              Copy Invoice
            </Button>
          </CopyToClipboard>
        : props.readyToCheckout && props.invoicePaid ?
          <Button
            className="w-full"
            icon={<QueueListIcon />}
            href="/atl/queue"
            size="small"
          >
            Song Queue
          </Button>
        : `` }
      </div>

    </>
  )
}
export default PaymentScreen;