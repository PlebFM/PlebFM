import React from "react";
import Image from "next/image";
import bokeh4 from "../../public/pfm-bokeh-4.jpg";
import Tag from "../../components/Tag";
import Avatar from "../../components/Avatar";
import qr from "../../public/qr.png"

export default function Queue(){
  const dummyData = [
    {
      trackTitle: "Bitcoin ipsum dolor sit amet",
      artistName: "Nonce inputs",
      feeRate: 98,
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
      upNext: false,
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

  const songProgress = 0.91

  const [queueData, setQueueData] = React.useState(dummyData)

  return(
    <>
      <div className="fixed w-full h-full bg-black top-0 left-0 bg-pfm-purple-100">
        <Image src={bokeh4} alt="" width="100" className="object-cover w-full h-full blur-2xl opacity-75" />
      </div>

      <div className="flex flex-row w-full h-screen justify-between relative z-[99] overflow-hidden">
        <div className="w-1/2 h-full text-white flex flex-col justify-between">
          <div className="bg-[#e4f1fb] m-16 p-4 w-[200px] h-[200px] inline mix-blend-multiply rounded-2xl">
            <Image
              src={qr}
              alt="https://pleb.fm/atl"
              width="200"
              height="200"
              className="w-full"
            />
          </div>
          <div className="text-3xl p-16 flex flex-col space-y-6">
            <p>Song Title</p>
            <p className="font-bold">Artist name</p>
            <div className="w-full bg-white/20 h-4 rounded-full drop-shadow relative ">
              <div
                className="bg-pfm-orange-500 h-full rounded-full"
                style={{width: (songProgress * 100) + '%'}}
              >
              </div>
              <div
                className="w-6 h-6 bg-pfm-orange-800 rounded-full absolute -top-1 drop-shadow"
                style={{left: ((songProgress * 100) - 1.5) + '%'}}
              >
              </div>
            </div>
          </div>
        </div>
        <div className="w-1/2 h-full overflow-y-scroll">
          <div className="text-white relative z-50 flex flex-col items-center min-h-screen font-thin bg-pfm-purple-300/50">
            {queueData.map((song, key)=>(
              <div className="p-6 border-b border-white/20 w-full" key={key}>
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
                  {song.upNext ?
                    <div className="mb-6">
                      <Tag
                        text={song.upNext ? "Up Next" : " "}
                        color={song.upNext ? "teal" : " "}
                      />
                    </div>
                  :
                    <p className="font-bold">
                      {song.feeRate} sats
                    </p>
                  }

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}