import albumPlaceholder from '../../public/album-placeholder.jpg';
import { ArrowLeftIcon } from '@bitcoin-design/bitcoin-icons-react/filled';
import Image from 'next/image';
import Button from './Button';
import bokeh2 from '../public/pfm-bokeh-2.jpg';
import { Dispatch, SetStateAction, useEffect } from 'react';
import NavBar from './NavBar';
import { Song } from '../models/Song';

export default function AlbumScreen(props: {
  track: Song;
  setSongConfirmed: Dispatch<SetStateAction<boolean>>;
  cancelSong: () => void;
}) {
  // useEffect(() => {
  //   console.log('TRACK', props?.track);
  //   console.log(props?.track?.album?.images[0]?.url);
  // }, [props.track]);
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
        <div className="w-full">
          <p className="text-xl">{props?.track?.name}</p>
          <p className="text-lg font-bold">{props?.track?.artists[0]?.name}</p>
          <p className="text-base">{props?.track?.album?.name}</p>
        </div>

        {/* eslint-disable */}
        <img
          src={props?.track?.album?.images[0]?.url ?? bokeh2}
          alt={props?.track?.album?.name ?? 'Album'}
          width={100}
          height={100}
          className="w-full"
        />

        <div className="w-full flex flex-col space-y-3">
          <Button
            size="small"
            className="w-full"
            onClick={() => {
              props.setSongConfirmed(true);
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
            onClick={() => props.cancelSong()}
          >
            Cancel
          </Button>
        </div>
      </div>
      <NavBar activeBtn="search" />
    </>
  );
}
