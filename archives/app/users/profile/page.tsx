// User profile
'use client';
import Image from 'next/image';
import bokeh5 from '../../../public/pfm-bokeh-5.jpg';
import Avatar from '../../../components/Avatar';
import React, { useState } from 'react';
import Tag from '../../../components/Tag';
import NavBar from '../../../components/NavBar';

export default function User() {
  const [userProfile, setUserProfile] = React.useState({
    firstNym: '',
    lastNym: '',
    color: '',
  });

  const getUserProfileFromLocal = () => {
    const userProfileJSON = localStorage.getItem('userProfile');
    if (userProfileJSON) {
      setUserProfile(JSON.parse(userProfileJSON));
    }
  };

  React.useEffect(() => {
    getUserProfileFromLocal();
  }, []);

  const dummyDataQueue = [
    {
      trackTitle: 'Freedom',
      artistName: 'Rage Against the Machine',
      feeRate: 100,
      playing: false,
      upNext: true,
      myPick: true,
      bidders: [
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
      ],
    },
    {
      trackTitle: 'Roll Me Up',
      artistName:
        'Willie Nelson, Snoop Dogg, Kris Kristofferson, Jamey Johnson',
      feeRate: 98,
      upNext: false,
      myPick: true,
      bidders: [
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
      ],
    },
  ];

  const dummyDataPlayed = [
    {
      trackTitle: 'Happiness in Slavery',
      artistName: 'Nine Inch Nails',
      feeRate: 100,
      myPick: true,
      bidders: [
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
      ],
    },
    {
      trackTitle: 'Hips Don’t Lie (feat. Wyclef Jean)',
      artistName: 'Shakira',
      feeRate: 98,
      myPick: true,
      bidders: [
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
      ],
    },
    {
      trackTitle: 'Legend Has It',
      artistName: 'Run the Jewels',
      feeRate: 87,
      myPick: true,
      bidders: [
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
      ],
    },
    {
      trackTitle: "Friday I'm in Love",
      artistName: 'The Cure',
      feeRate: 76,
      myPick: true,
      bidders: [
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
      ],
    },
    {
      trackTitle: 'Enter Sandman',
      artistName: 'Metallica',
      feeRate: 65,
      myPick: true,
      bidders: [
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Zazzy',
          lastNym: 'Fawkes',
          color: 'orange',
        },
        {
          firstNym: 'Squealing',
          lastNym: 'Kitty',
          color: 'purpleLight',
        },
        {
          firstNym: 'Silent',
          lastNym: 'Bankasaurus',
          color: 'purpleDark',
        },
        {
          firstNym: 'Insidious',
          lastNym: 'Goldbug',
          color: 'tealLight',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
      ],
    },
  ];

  const [queueData, setQueueData] = React.useState(dummyDataQueue);
  const [queueDataPlayed, setQueueDataPlayed] = React.useState(dummyDataPlayed);

  return (
    <>
      <div className="fixed w-full h-full bg-black top-0 left-0 bg-pfm-purple-100">
        <Image
          src={bokeh5}
          alt=""
          width="100"
          className="object-cover w-full h-full blur-2xl opacity-75"
        />
      </div>

      <div className="w-full px-0 py-12 pb-0 text-white relative z-50 flex flex-col space-y-6 items-center font-thin">
        <div className="w-2/3 mx-auto flex flex-col space-y-4 text-center">
          <Avatar
            firstNym={userProfile.firstNym}
            lastNym={userProfile.lastNym}
            color={userProfile.color}
          />
          <p className="text-2xl">
            {userProfile.firstNym
              ? userProfile.firstNym + ' ' + userProfile.lastNym
              : '- - -'}
          </p>
        </div>

        <h2 className="text-left font-bold w-full px-6">In Queue</h2>

        <div className="w-full pb-16 text-white relative z-50 flex flex-col items-center font-thin">
          {queueData.map((song, key) => (
            <div className="p-6 border-b border-white/20 w-full" key={key}>
              {song.playing || song.upNext || song.myPick ? (
                <div className="mb-6">
                  <Tag
                    text={
                      song.playing
                        ? 'Now Playing'
                        : song.upNext
                        ? 'Up Next'
                        : song.myPick
                        ? 'My Pick'
                        : ' '
                    }
                    color={
                      song.playing
                        ? 'orange'
                        : song.upNext
                        ? 'teal'
                        : song.myPick
                        ? 'purple'
                        : ' '
                    }
                  />
                </div>
              ) : (
                ``
              )}
              <div className="w-full flex justify-between space-x-4 w-full">
                <div className="flex flex-col space-y-2">
                  <div>
                    <p>{song.trackTitle}</p>
                    <p className="font-bold">{song.artistName}</p>
                  </div>
                  <div className="flex -space-x-1 items-center">
                    {song.bidders.slice(0, 5).map((bidder, key) => (
                      <div className="w-8" key={key}>
                        <Avatar
                          firstNym={bidder.firstNym}
                          lastNym={bidder.lastNym}
                          color={bidder.color}
                          size="xs"
                        />
                      </div>
                    ))}
                    {song.bidders.length > 5 ? (
                      <div className="pl-4 font-semibold text-lg">
                        +{song.bidders.length - 5}
                      </div>
                    ) : (
                      ``
                    )}
                  </div>
                </div>
                <p className="font-bold">{song.feeRate} sats</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-left font-bold w-full px-6">Already played</h2>

        <div className="w-full pb-36 text-white relative z-50 flex flex-col items-center min-h-screen font-thin">
          {queueDataPlayed.map((song, key) => (
            <div className="p-6 border-b border-white/20 w-full" key={key}>
              {song.playing || song.upNext || song.myPick ? (
                <div className="mb-6">
                  <Tag
                    text={
                      song.playing
                        ? 'Now Playing'
                        : song.upNext
                        ? 'Up Next'
                        : song.myPick
                        ? 'My Pick'
                        : ' '
                    }
                    color={
                      song.playing
                        ? 'orange'
                        : song.upNext
                        ? 'teal'
                        : song.myPick
                        ? 'purple'
                        : ' '
                    }
                  />
                </div>
              ) : (
                ``
              )}
              <div className="w-full flex justify-between space-x-4 w-full">
                <div className="flex flex-col space-y-2">
                  <div>
                    <p>{song.trackTitle}</p>
                    <p className="font-bold">{song.artistName}</p>
                  </div>
                  <div className="flex -space-x-1 items-center">
                    {song.bidders.slice(0, 5).map((bidder, key) => (
                      <div className="w-8" key={key}>
                        <Avatar
                          firstNym={bidder.firstNym}
                          lastNym={bidder.lastNym}
                          color={bidder.color}
                          size="xs"
                        />
                      </div>
                    ))}
                    {song.bidders.length > 5 ? (
                      <div className="pl-4 font-semibold text-lg">
                        +{song.bidders.length - 5}
                      </div>
                    ) : (
                      ``
                    )}
                  </div>
                </div>
                <p className="font-bold">{song.feeRate} sats</p>
              </div>
            </div>
          ))}
        </div>

        <NavBar activeBtn="profile" />
      </div>
    </>
  );
}
