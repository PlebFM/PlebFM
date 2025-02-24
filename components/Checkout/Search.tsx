import React from 'react';
import NavBar from '../Utils/NavBar';
import plebFMLogo from '../../public/plebfm-logo.svg';
import bokeh2 from '../../public/pfm-bokeh-2.jpg';
import Image from 'next/image';
import { Spinner } from '../Utils/LoadingSpinner';
import Tag from '../Utils/Tag';
import { useSearch } from '../hooks/useSearch';

type Props = {
  selectSong: (song: string) => void;
};

export default function Search({ selectSong }: Props) {
  const { setSearchTerm, searchTerm, searchResult, queue, loading } =
    useSearch();

  return (
    <>
      <div className="fixed w-full h-full bg-black top-0 left-0 bg-pfm-purple-100">
        <Image
          src={bokeh2}
          alt="xl"
          width="100"
          className="object-cover w-full h-full blur-2xl opacity-50"
        />
      </div>

      <div className="max-w-screen-sm m-auto py-12 pb-36 text-white relative z-50 flex flex-col items-center min-h-screen font-thin">
        <div className="px-6 py-0 space-y-6 flex flex-col top-0 left-0 z-[99]">
          <Image
            src={plebFMLogo}
            alt="PlebFM"
            className="w-auto mx-auto lg:w-full"
          />

          <div className="text-left space-y-2">
            <label className="uppercase font-bold text-left tracking-widest text-xs">
              Search for a Song
            </label>
            <input
              autoFocus
              type="text"
              placeholder="Bitcoin killed the fiat star..."
              className="w-full p-4 text-lg bg-white/10 placeholder:text-pfm-neutral-800 text-pfm-orange-800 outline outline-2 outline-white focus:outline-pfm-orange-800"
              onChange={e => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
          </div>

          {searchTerm.length < 1 ? (
            <div className="w-full flex flex-col justify-center items-center">
              <svg
                width="29"
                height="168"
                viewBox="0 0 29 168"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.2381 165.65C16.0115 166.447 16.4738 167.276 17.2706 167.503C18.0675 167.73 18.8971 167.267 19.1237 166.47L16.2381 165.65ZM8.24429 0.97334C7.49779 0.614144 6.60144 0.928121 6.24225 1.67463L0.388819 13.8396C0.0296247 14.5861 0.343603 15.4825 1.09011 15.8417C1.83661 16.2009 2.73296 15.8869 3.09215 15.1404L8.2952 4.32706L19.1085 9.5301C19.855 9.8893 20.7514 9.57532 21.1106 8.82881C21.4698 8.08231 21.1558 7.18596 20.4093 6.82677L8.24429 0.97334ZM19.1237 166.47C31.5318 122.832 33.5125 71.7806 9.00957 1.82912L6.17825 2.82089C30.4875 72.2194 28.4682 122.638 16.2381 165.65L19.1237 166.47Z"
                  fill="white"
                />
              </svg>
              <p className="text-xl font-medium">Type in a song name</p>
            </div>
          ) : (
            ``
          )}
        </div>

        {searchResult.length > 0 || loading ? (
          <div className="absolute top-0 left-0 w-full h-full pt-56 pb-32 overflow-hidden z-[98]">
            <div className="h-full overflow-y-scroll w-full">
              {searchResult.length > 0 ? (
                searchResult.map((track, key) => (
                  <div
                    key={key}
                    className="flex flex-row items-center justify-between px-7 py-4 border-b border-b-1 border-white/20"
                  >
                    <div
                      className=""
                      onClick={() => selectSong(JSON.stringify(track))}
                    >
                      <p className="pointer-events-none">
                        {track?.name ?? 'Track Name'}
                      </p>
                      <p className="font-bold text-[12px] pointer-events-none">
                        {track?.artists[0]?.name ?? 'Artist Name'}
                      </p>
                    </div>
                    <Tag song={queue?.get(track?.id)} showQueued={true} />
                  </div>
                ))
              ) : loading ? (
                <div className="w-full h-full flex justify-center items-center">
                  <Spinner />
                </div>
              ) : (
                ``
              )}
            </div>
          </div>
        ) : (
          ``
        )}

        <NavBar activeBtn="search" />
      </div>
    </>
  );
}
