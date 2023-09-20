import {
  ArrowRightIcon,
  CartIcon,
  CopyIcon,
  CrossIcon,
} from '@bitcoin-design/bitcoin-icons-react/filled';
import bokeh2 from '../../public/pfm-bokeh-2.jpg';
import Button from '../Utils/Button';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import NavBar from '../Utils/NavBar';
import { Song } from '../../models/Song';
import { CheckoutHeader } from './CheckoutHeader';

export default function SelectBid(props: {
  song: Song;
  setReadyToCheckout: Dispatch<SetStateAction<boolean>>;
  cancelSong: () => void;
  setTotalBid: Dispatch<SetStateAction<number>>;
  setBid: Dispatch<SetStateAction<number>>;
}) {
  const maxSats = parseInt(process.env.NEXT_PUBLIC_MAX_BID ?? '100');
  const [feeRate, setFeeRate] = useState(0);
  const [feeTotal, setFeeTotal] = useState(0);
  const [feeBracket, setFeeBracket] = useState(0);
  const sliderMessages = [
    'Choose your bid',
    'Nice!',
    'Whoa!',
    'High roller!',
    'Dayum!',
  ];
  const sliderEmojis = ['👇', '👍', '😮', '💰', '🔥'];
  const [sliderMouseDown, setSliderMouseDown] = useState(false);
  const ref = useRef(null);
  let slider = document.getElementById('slider');

  const handleMouseDown = () => {
    setSliderMouseDown(true);
  };

  const handleMouseUp = () => {
    setSliderMouseDown(false);
  };

  const updateFees = (fee: number) => {
    setFeeRate(fee);
    setFeeTotal(Math.floor((fee * props.song.duration_ms) / 60_000));
    if (fee === 0) setFeeBracket(0);
    else if (fee > 0 && fee <= 0.25 * maxSats) setFeeBracket(1);
    else if (fee > 0.25 * maxSats && fee <= 0.5 * maxSats) setFeeBracket(2);
    else if (fee > 0.5 * maxSats && fee <= 0.75 * maxSats) setFeeBracket(3);
    else setFeeBracket(4);
  };

  const handleMouseMove = (e: { clientX: number }) => {
    if (!slider) return;
    if (sliderMouseDown) {
      let rect = slider.getBoundingClientRect();
      // @ts-ignore
      let posInRange =
        e.clientX < rect.left + 40 // IF mouse is to the left of the slider curve
          ? 0 // Hug 0
          : e.clientX > rect.width + rect.left - 40 // IF mouse is to the right of the slider curve
          ? rect.width - 40 - 40 // Hug [width of slider curve]
          : e.clientX - rect.left - 40; // ELSE hug the mouse position
      // @ts-ignore
      updateFees(Math.floor((posInRange / (rect.width - 40 - 40)) * maxSats));
    }
  };

  return (
    <>
      <div className="fixed w-full h-full bg-black top-0 left-0 bg-pfm-purple-100">
        {/* eslint-disable */}
        <img
          src={props?.song?.album?.images[0]?.url ?? bokeh2}
          alt={props?.song?.album?.name ?? 'Album'}
          width={100}
          height={100}
          className="object-cover w-full h-full blur-2xl opacity-50"
        />
        {/* <Image src={albumPlaceholder} alt="" width="100" className="object-cover w-full h-full blur-2xl opacity-50" /> */}
      </div>

      <div className="m-auto max-w-xl px-12 pt-12 pb-36 text-white relative z-50 flex flex-col space-y-8 items-center min-h-screen font-thin">
        <CheckoutHeader song={props?.song} />
        <div
          className="bg-white/10 w-[348px] h-[348px] p-[32px] rounded-full flex flex-col space-y-2 text-center p-8 touch-none relative"
          onPointerDown={handleMouseDown}
          onPointerUp={handleMouseUp}
          onPointerMove={handleMouseMove}
          id="slider"
          ref={ref}
        >
          <div className="text-4xl font-bold flex flex-col -space-y-1 font-light">
            <span className="text-5xl">{feeRate}</span>
            <span className="text-xl">sats/min</span>
          </div>

          <div className="text-4xl font-bold flex flex-col -space-y-1 font-light">
            <span className="text-2xl">{feeTotal}</span>
            <span className="text-base">sats total</span>
          </div>

          <div className="text-4xl font-bold flex flex-col font-light">
            <span className="text-lg">{sliderMessages[feeBracket]}</span>
            <span className="text-4xl">{sliderEmojis[feeBracket]}</span>
          </div>

          <svg
            width="348"
            height="348"
            viewBox="0 0 348 348"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="overflow absolute top-0 left-0 w-full"
          >
            <ellipse
              cx="174"
              cy="174"
              rx="114"
              ry="114"
              stroke="white"
              strokeOpacity="0.2"
              strokeWidth="36"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="255 1000"
              strokeDashoffset="0"
              transform="rotate(24 174 174)"
              id="smile"
            />
            <ellipse
              cx="174"
              cy="174"
              rx="114"
              ry="114"
              stroke="white"
              strokeOpacity="0.5"
              strokeWidth="36"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1,999"
              strokeDashoffset="698"
              transform={'rotate(' + (feeRate / maxSats) * -128 + ' 174 174)'}
            />
          </svg>
        </div>

        <div className="w-screen-sm">
          {feeRate < 1 ? (
            <Button
              className="w-full"
              icon={<CrossIcon />}
              iconPosition="left"
              onClick={props.cancelSong}
            >
              Cancel
            </Button>
          ) : (
            <>
              <Button
                className="w-full"
                icon={<ArrowRightIcon />}
                onClick={() => {
                  props.setTotalBid(feeTotal);
                  props.setBid(feeRate);
                  props.setReadyToCheckout(true);
                }}
              >
                Checkout
              </Button>
              <Button
                className="w-full"
                icon={<CrossIcon />}
                iconPosition="left"
                onClick={props.cancelSong}
                style="free"
                size="small"
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
      <NavBar activeBtn="search" />
    </>
  );
}
