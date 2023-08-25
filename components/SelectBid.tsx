import {
  ArrowRightIcon,
  CartIcon,
  CopyIcon,
  CrossIcon,
} from '@bitcoin-design/bitcoin-icons-react/filled';
import bokeh2 from '../public/pfm-bokeh-2.jpg';
import Button from './Button';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import NavBar from './NavBar';
import { Song } from '../models/Song';

export default function SelectBid(props: {
  song: Song;
  setReadyToCheckout: Dispatch<SetStateAction<boolean>>;
  cancelSong: () => void;
  setTotalBid: Dispatch<SetStateAction<number>>;
  setBid: Dispatch<SetStateAction<number>>;
}) {
  const maxSats = 100;
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
    else if (fee > 0 && fee <= 25) setFeeBracket(1);
    else if (fee > 25 && fee <= 50) setFeeBracket(2);
    else if (fee > 50 && fee <= 75) setFeeBracket(3);
    else setFeeBracket(4);
  };

  const handleMouseMove = (e: { clientX: number }) => {
    if (!slider) return;
    if (sliderMouseDown) {
      // @ts-ignore
      let posInRange =
        e.clientX < slider.offsetLeft + 40
          ? 0
          : e.clientX > slider.offsetWidth + slider.offsetLeft - 40
          ? slider.offsetWidth - 40
          : e.clientX - slider.offsetLeft - 40;
      // @ts-ignore
      updateFees(
        Math.floor((posInRange / (slider.offsetWidth - 40 - 40)) * maxSats),
      );
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

      <div className="px-12 pt-12 pb-36 text-white relative z-50 flex flex-col space-y-8 items-center min-h-screen font-thin">
        <div className="max-w-screen-sm">
          <p className="text-xl">{props.song?.name}</p>
          <p className="text-lg font-bold">{props.song?.artists[0]?.name}</p>
          <p className="text-base">{props.song?.album?.name}</p>
        </div>

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
            width="241"
            height="97"
            viewBox="0 0 241 97"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="overflow absolute bottom-[40px] left-0 w-full"
          >
            <path
              d="M16.8713 16.8016C26.6091 35.913 41.4422 51.9594 59.7308 63.1666C78.0193 74.3738 99.0508 80.3053 120.5 80.3053C141.949 80.3053 162.981 74.3738 181.269 63.1666C199.558 51.9594 214.391 35.913 224.129 16.8016"
              stroke="white"
              strokeOpacity="0.2"
              strokeWidth="32"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16.8713 16.8016C26.6091 35.913 41.4422 51.9594 59.7308 63.1666C78.0193 74.3738 99.0508 80.3053 120.5 80.3053C141.949 80.3053 162.981 74.3738 181.269 63.1666C199.558 51.9594 214.391 35.913 224.129 16.8016"
              stroke="white"
              strokeOpacity="0.5"
              strokeWidth="34"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1,260"
              strokeDashoffset={260 - 260 * (feeRate / 100)}
            />
          </svg>
        </div>

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
      <NavBar activeBtn="search" />
    </>
  );
}
