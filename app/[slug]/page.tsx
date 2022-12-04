"use client"
// pleb.fm/shiners
// Bidding landing page


import { Customer } from "../../models/Customer";
import { notFound } from "next/navigation";
import SearchBox from "./SearchBox";
import bokeh1 from "public/pfm-bokeh-1.jpg"
import Image from "next/image"
import {ArrowLeftIcon, ArrowRightIcon, CrossIcon} from "@bitcoin-design/bitcoin-icons-react/outline"
import "../../app/globals.css"
import Button from "../../components/Button"
import Boop from "../../components/Boop"
import React from "react";

type Props = { params: {
    slug: string
  },
  searchParams: {}
}


const getCustomers = async (): Promise<Customer[]> => {
  const res = await fetch("http://0.0.0.0:3000/api/customers", {
    method: 'GET',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });
  if (!res.ok) throw new Error('unable to fetch data');
  const customers = await res.json();
  return customers.customers;
}
const getCustomer = async (slug: string): Promise<Customer> => {
  const res = await fetch(`http://0.0.0.0:3000/api/customers/${slug}`, {
    method: 'GET',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });
  if (!res.ok) notFound();
  const customer = await res.json();
  return customer.customer;
}

export default function Bidding({params, searchParams}: Props) {
  const newUser = true
  const [currentSlide, setCurrentSlide] = React.useState(0)

  if(newUser) {
    const slides = [
      {
        text: 'Welcome to PlebFM, the lightning jukebox. Here’s how it works.',
      },
      {
        text: 'Search for your favorite song in the whole world.'
      },
      {
        text: 'Pay for it with your favorite lightning wallet.'
      },
      {
        text: 'Outbid others to push your song to the top of the queue.'
      },
      {
        text: 'One moment. Generating your secret identity...'
      }
    ]

    const nextSlide = ()=>{
      if(currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1)
    }

    const prevSlide = ()=>{
      if(currentSlide > 0) setCurrentSlide(currentSlide - 1)
    }

    const gotoSlide = (slide:number) =>{
      setCurrentSlide(slide)
    }

    const slideText = ()=>{
      return(
          <>
            Test
          </>
      )
    }

    return(
      <>
        <div className="fixed w-full h-full bg-black top-0 left-0 bg-pfm-purple-100">
          <Image src={bokeh1} alt="" width="100" className="object-cover w-full h-full blur-2xl opacity-75" />
        </div>
        <div className="px-6 py-12 text-white relative z-50 justify-between flex flex-col space-y-6 items-center min-h-screen font-thin">
          <div>
            <svg width="277" height="274" viewBox="0 0 277 274" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="138.499" cy="137" r="112" fill="#4B3C5D" fillOpacity="0.5"/>
              <g opacity="0.2">
              <path fillRule="evenodd" clipRule="evenodd" d="M249.06 155C250.007 149.14 250.499 143.127 250.499 137C250.499 130.873 250.007 124.86 249.06 119L252.499 119C262.44 119 270.499 127.059 270.499 137C270.499 146.941 262.44 155 252.499 155H249.06ZM27.9376 155H24.499C14.5579 155 6.49902 146.941 6.49902 137C6.49902 127.059 14.5579 119 24.499 119H27.9376C26.9909 124.86 26.4989 130.873 26.4989 137C26.4989 143.127 26.9909 149.14 27.9376 155Z" fill="white"/>
              <circle cx="138.499" cy="137" r="122" stroke="white" strokeWidth="20"/>
              </g>
              <g filter="url(#filter0_d_934_9092)">
              <path d="M66.3275 174.046C73.1093 187.274 83.4397 198.381 96.1766 206.138C108.914 213.895 123.561 218 138.499 218C153.437 218 168.084 213.895 180.821 206.138C193.558 198.381 203.889 187.274 210.671 174.046" stroke="#E6E6E6" strokeOpacity="0.5" strokeWidth="24.7737" strokeLinecap="round" strokeLinejoin="round" shapeRendering="crispEdges"/>
              </g>
              <g filter="url(#filter1_d_934_9092)">
              <path d="M66.3275 174.046C66.4045 174.197 66.482 174.347 66.56 174.496" stroke="white" strokeWidth="24.7737" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <rect x="63.499" y="70.0001" width="64.6868" height="64.6868" rx="32.3434" fill="white" fillOpacity="0.2"/>
              <path d="M93.2259 118.844V106.251H103.748V100.386H93.2259V93.6588H106.336V87.7938H87.361V118.844H93.2259Z" fill="#B3B3B3"/>
              <rect x="148.831" y="70.0001" width="64.6868" height="64.6868" rx="32.3434" fill="white" fillOpacity="0.2"/>
              <path d="M170.669 118.844V100.3L179.682 118.844H181.752L190.765 100.3V118.844H196.242V87.7938H190.981L180.717 108.407L170.454 87.7938H165.193L165.193 118.844H170.669Z" fill="#B3B3B3"/>
              <defs>
              <filter id="filter0_d_934_9092" x="37.4222" y="145.141" width="202.154" height="101.762" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset/>
              <feGaussianBlur stdDeviation="8.25789"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_934_9092"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_934_9092" result="shape"/>
              </filter>
              <filter id="filter1_d_934_9092" x="37.4222" y="145.141" width="58.0428" height="58.2605" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
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
            {slides[currentSlide].text}
          </p>

          <Button size="large" icon={<ArrowRightIcon />} onClick={nextSlide}>Continue</Button>

          <div className="flex flex-row space-x-4">
            {currentSlide > 0 ? <Button icon={<ArrowLeftIcon />} iconPosition="left" size="small" style="free" onClick={prevSlide}>Back</Button> : ``}

            {currentSlide < slides.length -1 ? <Button icon={<CrossIcon />} iconPosition="left" size="small" style="free" onClick={()=>{gotoSlide(slides.length - 1)}}>Skip</Button> : ``}
          </div>

          <div className="flex space-x-6">
            {slides.map((slide, key)=>(
                <Boop active={currentSlide === key} key={key} />
            ))}
          </div>
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


export async function generateStaticParams() {
  const customers: Customer[] = await getCustomers();
  console.error(customers);
  // return customers;

  return customers.map((customer: Customer) => {
    return { slug: customer.shortName };
  });
}

