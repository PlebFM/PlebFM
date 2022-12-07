"use-client"
import { useState } from "react";
import {webpack} from "next/dist/compiled/webpack/webpack";
import javascript = webpack.javascript;
import AlbumScreen from "./AlbumScreen"
import PaymentScreen from "./PaymentScreen"
import SelectBid from "./SelectBid"

interface CheckoutProps {
  // songId: string,
  song: object,
  parentCallback: javascript,
  slug: string
}

export default function Checkout(props:CheckoutProps) {

  const [songConfirmed, setSongConfirmed] = useState(false)
  const [readyToCheckout, setReadyToCheckout] = useState(false)
  const [invoicePaid, setInvoicePaid] = useState(false)
  const [totalBid, setTotalBid] = useState(0)
  const [bid, setBid] = useState(0)


  const cancelSong = ()=>{
    props.parentCallback('')
  }

  // Displays album art, user has chance to back out of song
  if(!songConfirmed) {
    return (
      <AlbumScreen track={props.song} setSongConfirmed={setSongConfirmed} cancelSong={cancelSong} />
    )
  }
  // User has confirmed bid amount, display invoice OR display that invoice has been successfully paid
  else if(readyToCheckout || invoicePaid) {
    return (
      <PaymentScreen song={props.song} readyToCheckout={readyToCheckout} invoicePaid={invoicePaid} setInvoicePaid={setInvoicePaid} totalBid={totalBid} bid={bid} />
    );
  }
  // User has confirmed song, displays radial slider to choose bid amount
  else {
    return (
      <SelectBid song={props.song} setReadyToCheckout={setReadyToCheckout} cancelSong={cancelSong} setTotalBid={setTotalBid} setBid={setBid} />
    )
  }


}