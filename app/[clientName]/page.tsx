"use client"
// pleb.fm/shiners
// Bidding landing page

import SearchBox from "./SearchBox";
import bokeh1 from "public/pfm-bokeh-1.jpg"
import Image from "next/image"
import {BitcoinIcon} from "@bitcoin-design/bitcoin-icons-react/filled"

type param = {
  myparam: string
}

type params = {
  searchParams: param
}

export default function Bidding({searchParams}: params) {
  const newUser = true

  if(newUser) {
    return(
      <>
        <div className="fixed w-full h-full bg-black top-0 left-0 bg-pfm-purple-100">
          <Image src={bokeh1} alt="" width="100" className="object-cover w-full h-full blur-2xl opacity-75" />
        </div>
        <div className="px-12 py-24 text-white relative z-50">
          <div>
            Animation
          </div>

          <p className="text-2xl">
            Welcome to PlebFM,the lightning jukebox. Here’s how it works.
          </p>

          <p className="text-4xl">Continue</p>
        </div>
      
        {/* export default function Bidding({ params }: {params: {clientName: string}}) { */}
      </>
    )
  }
  else {
    return (
      <>
        <h1>Hello World! Bidding landing page</h1>
        <SearchBox />
      </>
    );
  }
}