"use client"
import Link from "next/link";
import Image from "next/image";
import bokeh3 from "../../../public/pfm-bokeh-3.jpg"
import React from "react"
import NavBar from "../../../components/NavBar"
import Avatar from "../../../components/Avatar";
import Tag from "../../../components/Tag";

// pleb.fm/bantam/queue
export default function Queue() {
  const dummyData = [
    {
      trackTitle: "Bitcoin ipsum dolor sit amet",
      artistName: "Nonce inputs",
      feeRate: 100,
      playing: true,
      upNext: false,
      bidders: [
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        },
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        }
      ]
    },
    {
      trackTitle: "Bitcoin ipsum dolor sit amet",
      artistName: "Nonce inputs",
      feeRate: 98,
      playing: false,
      upNext: true,
      bidders: [
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        },
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        }
      ]
    },
    {
      trackTitle: "Bitcoin ipsum dolor sit amet",
      artistName: "Nonce inputs",
      feeRate: 87,
      playing: false,
      upNext: false,
      bidders: [
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        },
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        }
      ]
    },
    {
      trackTitle: "Bitcoin ipsum dolor sit amet",
      artistName: "Nonce inputs",
      feeRate: 76,
      playing: false,
      upNext: false,
      bidders: [
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        },
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        }
      ]
    },
    {
      trackTitle: "Bitcoin ipsum dolor sit amet",
      artistName: "Nonce inputs",
      feeRate: 65,
      playing: false,
      upNext: false,
      myPick: true,
      bidders: [
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        },
        {
          firstNym: "Zazzy",
          lastNym: "Fawkes",
          color: "orange"
        },
        {
          firstNym: "Squealing",
          lastNym: "Kitty",
          color: "purpleLight"
        },
        {
          firstNym: "Silent",
          lastNym: "Bankasaurus",
          color: "purpleDark"
        },
        {
          firstNym: "Insidious",
          lastNym: "Goldbug",
          color: "tealLight"
        },
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        },
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        },
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        }
      ]
    },
    {
      trackTitle: "Bitcoin ipsum dolor sit amet",
      artistName: "Nonce inputs",
      feeRate: 54,
      playing: false,
      upNext: false,
      bidders: [
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        },
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        }
      ]
    },
    {
      trackTitle: "Bitcoin ipsum dolor sit amet",
      artistName: "Nonce inputs",
      feeRate: 43,
      playing: false,
      upNext: false,
      bidders: [
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        },
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        }
      ]
    },
    {
      trackTitle: "Bitcoin ipsum dolor sit amet",
      artistName: "Nonce inputs",
      feeRate: 32,
      playing: false,
      upNext: false,
      bidders: [
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        },
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        }
      ]
    },
    {
      trackTitle: "Bitcoin ipsum dolor sit amet",
      artistName: "Nonce inputs",
      feeRate: 21,
      playing: false,
      upNext: false,
      bidders: [
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        },
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        }
      ]
    },
    {
      trackTitle: "Bitcoin ipsum dolor sit amet",
      artistName: "Nonce inputs",
      feeRate: 10,
      playing: false,
      upNext: false,
      bidders: [
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        },
        {
          firstNym: "Fluffy",
          lastNym: "Honeybadger",
          color: "teal"
        }
      ]
    },
  ]

  const [queueData, setQueueData] = React.useState(dummyData)

  return (
    <>
      <div className="fixed w-full h-full bg-black top-0 left-0 bg-pfm-purple-100">
        <Image src={bokeh3} alt="" width="100" className="object-cover w-full h-full blur-2xl opacity-50" />
      </div>

      <div className="pb-36 text-white relative z-50 flex flex-col items-center min-h-screen font-thin">
        {queueData.map((song, key)=>(
          <div className="p-6 border-b border-white/20 w-full" key={key}>
            {song.playing || song.upNext || song.myPick ?
            <div className="mb-6">
              <Tag
                text={song.playing ? "Now Playing" : song.upNext ? "Up Next" : song.myPick ? "My Pick" : " "}
                color={song.playing ? "orange" : song.upNext ? "teal" : song.myPick ? "purple" : " "}
              />
            </div>
            : ``}
            <div className="w-full flex justify-between space-x-4 w-full">
              <div className="flex flex-col space-y-2">
                <div>
                  <p>{song.trackTitle}</p>
                  <p className="font-bold">{song.artistName}</p>
                </div>
                <div className="flex -space-x-1 items-center">
                  {song.bidders.slice(0,5).map((bidder, key)=>(
                    <div className="w-8" key={key}>
                      <Avatar
                        firstNym={bidder.firstNym}
                        lastNym={bidder.lastNym}
                        color={bidder.color}
                        size="xs"
                      />
                    </div>
                  ))}
                  {song.bidders.length > 5 ?
                  <div className="pl-4 font-semibold text-lg">
                    +{song.bidders.length - 5}
                  </div>
                    : ``}
                </div>
              </div>
              <p className="font-bold">{song.feeRate} sats</p>
            </div>
          </div>
        ))}
      </div>

      <NavBar activeBtn="queue" />
    </>
  );
}