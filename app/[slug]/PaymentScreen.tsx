"use client"
import { CartIcon, CopyIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import bokeh2 from "../../public/pfm-bokeh-2.jpg"
import { MusicalNoteIcon, QueueListIcon } from "@heroicons/react/24/outline";
import Button from "../../components/Button";
import { useEffect } from "react";

function PaymentScreen(props: {song, readyToCheckout, invoicePaid, setInvoicePaid}) {
  useEffect(() => {
    console.log("TRACK", props?.song);
    console.log(props?.song?.album?.images[0]?.url)
    console.log("INSIDE",props);
  }, [props])

  return(
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
          <Button
            className="w-full"
            icon={<CopyIcon />}
            onClick={()=>{alert('Invoice copied to clipboard!'); props.setInvoicePaid(true);}}
            size="small"
          >
            Copy Invoice
          </Button>
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