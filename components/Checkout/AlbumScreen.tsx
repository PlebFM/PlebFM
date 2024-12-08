import albumPlaceholder from '../../public/album-placeholder.jpg';
import { ArrowLeftIcon } from '@bitcoin-design/bitcoin-icons-react/filled';
import Image from 'next/image';
import Button from '../Utils/Button';
import bokeh2 from '../../public/pfm-bokeh-2.jpg';
import { Dispatch, SetStateAction, useEffect } from 'react';
import NavBar from '../Utils/NavBar';
import { Song } from '../../models/Song';
import { CheckoutHeader } from './CheckoutHeader';

type Props = {
  track: Song;
  setSongConfirmed: Dispatch<SetStateAction<boolean>>;
  cancelSong: () => void;
};

export default function AlbumScreen({
  track,
  setSongConfirmed,
  cancelSong,
}: Props) {
  return (
    <>
      <div className="fixed w-full h-full bg-black top-0 left-0 bg-pfm-purple-100">
        <Image
          src={bokeh2}
          alt=""
          width="100"
          className="object-cover w-full h-full blur-2xl opacity-50"
        />
      </div>

      <div className="m-auto max-w-xl px-12 pt-12 pb-36 text-white relative z-50 flex flex-col space-y-8 items-center min-h-screen font-thin">
        <CheckoutHeader song={track} />

        {/* eslint-disable */}
        <img
          src={track?.album?.images[0]?.url ?? bokeh2}
          alt={track?.album?.name ?? 'Album'}
          width={100}
          height={100}
          className="w-full"
        />

        <div className="w-full flex flex-col space-y-3">
          <Button
            size="small"
            className="w-full"
            onClick={() => {
              setSongConfirmed(true);
            }}
          >
            Select Song
          </Button>
          <Button
            size="small"
            style="free"
            className="w-full"
            icon={<ArrowLeftIcon />}
            iconPosition="left"
            onClick={cancelSong}
          >
            Cancel
          </Button>
        </div>
      </div>
      <NavBar activeBtn="search" />
    </>
  );
}
