"use client"
// pleb.fm/shiners
// Bidding landing page

import SearchBox from "./SearchBox";
import bokeh1 from "public/pfm-bokeh-1.jpg"
import Image from "next/image"
import {BitcoinIcon} from "@bitcoin-design/bitcoin-icons-react/filled"
import "../../app/globals.css"

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
        <div className="px-6 py-12 text-white relative z-50 justify-between flex flex-col items-center min-h-screen font-thin">
          <div>
            <svg width="277" height="274" viewBox="0 0 277 274" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="138.499" cy="137" r="112" fill="#4B3C5D" fill-opacity="0.5"/>
              <g opacity="0.2">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M249.06 155C250.007 149.14 250.499 143.127 250.499 137C250.499 130.873 250.007 124.86 249.06 119L252.499 119C262.44 119 270.499 127.059 270.499 137C270.499 146.941 262.44 155 252.499 155H249.06ZM27.9376 155H24.499C14.5579 155 6.49902 146.941 6.49902 137C6.49902 127.059 14.5579 119 24.499 119H27.9376C26.9909 124.86 26.4989 130.873 26.4989 137C26.4989 143.127 26.9909 149.14 27.9376 155Z" fill="white"/>
              <circle cx="138.499" cy="137" r="122" stroke="white" stroke-width="20"/>
              </g>
              <g filter="url(#filter0_d_934_9092)">
              <path d="M66.3275 174.046C73.1093 187.274 83.4397 198.381 96.1766 206.138C108.914 213.895 123.561 218 138.499 218C153.437 218 168.084 213.895 180.821 206.138C193.558 198.381 203.889 187.274 210.671 174.046" stroke="#E6E6E6" stroke-opacity="0.5" stroke-width="24.7737" stroke-linecap="round" stroke-linejoin="round" shape-rendering="crispEdges"/>
              </g>
              <g filter="url(#filter1_d_934_9092)">
              <path d="M66.3275 174.046C66.4045 174.197 66.482 174.347 66.56 174.496" stroke="white" stroke-width="24.7737" stroke-linecap="round" stroke-linejoin="round"/>
              </g>
              <rect x="63.499" y="70.0001" width="64.6868" height="64.6868" rx="32.3434" fill="white" fill-opacity="0.2"/>
              <path d="M93.2259 118.844V106.251H103.748V100.386H93.2259V93.6588H106.336V87.7938H87.361V118.844H93.2259Z" fill="#B3B3B3"/>
              <rect x="148.831" y="70.0001" width="64.6868" height="64.6868" rx="32.3434" fill="white" fill-opacity="0.2"/>
              <path d="M170.669 118.844V100.3L179.682 118.844H181.752L190.765 100.3V118.844H196.242V87.7938H190.981L180.717 108.407L170.454 87.7938H165.193L165.193 118.844H170.669Z" fill="#B3B3B3"/>
              <defs>
              <filter id="filter0_d_934_9092" x="37.4222" y="145.141" width="202.154" height="101.762" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset/>
              <feGaussianBlur stdDeviation="8.25789"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_934_9092"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_934_9092" result="shape"/>
              </filter>
              <filter id="filter1_d_934_9092" x="37.4222" y="145.141" width="58.0428" height="58.2605" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset/>
              <feGaussianBlur stdDeviation="8.25789"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.2 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_934_9092"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_934_9092" result="shape"/>
              </filter>
              </defs>
            </svg>
          </div>

          <p className="text-3xl leading-relaxed text-center">
            Welcome to <strong>PlebFM</strong>,<br />the lightning jukebox.<br />Here’s how it&nbsp;works.
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