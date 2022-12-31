'use client'
import Link from "next/link";
import Image from "next/image";
import bokeh3 from "../../../public/pfm-bokeh-3.jpg"
import { useEffect, useState } from "react"
import NavBar from "../../../components/NavBar"
import Avatar from "../../../components/Avatar";
import Tag from "../../../components/Tag";
import querystring from 'querystring';
import LoadingSpinner from "../../../components/LoadingSpinner";

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

  const getUserProfileFromLocal = ()=> {
    const userProfileJSON = localStorage.getItem('userProfile')
    if(userProfileJSON) {
      return JSON.parse(userProfileJSON);
    }
  }
  const [queueData, setQueueData] = useState([]);
  const [userProfile, setUserProfile] = useState([]);
  const [loading, setLoading] = useState(false)
  // if (songId === "") return [];
  useEffect(() => {

  }, [])
  useEffect(() => {
    setLoading(true);
    const userProfile = getUserProfileFromLocal();
    setUserProfile(userProfile);
    console.log('user', userProfile);

    const fetchSong = async (songId: string, shortName: string) => {
      const queryString = new URLSearchParams({ id: songId, shortName: shortName });
      const res = await fetch(`/api/spotify/getSong?${queryString}`, {
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
      if (!res.ok) throw new Error('Failed to search song');
      const result =  await res.json();
      // console.log('FETCH RES', result)
      return result;
    };

    const getQueue = async () => {
      const queries = querystring.stringify({
        shortName: 'atl'
      });
      const response = await fetch(`/api/leaderboard/queue?${queries}`);
      const res = await response.json();
      const promises = res.queue.map((x: any) => {
        const res = fetchSong(x.songId, 'atl').then(song => {
          return {obj: x, song: song}
        });
        return res;
      }) 
      const songs = await Promise.all(promises);
      console.log(songs)
      const fixed = songs.map((pair) => {
        const {obj, song} = pair;

        const totalBid = obj.bids.reduce((x: any, y: any) => x+=y.bidAmount, 0);
        const myPick = obj.bids.filter((x: any) => x.userId === userProfile.userId).length > 0;
        return {
          trackTitle: song.name,
          artistName: song.artists[0].name,
          feeRate: totalBid,
          playing: false,
          myPick: myPick,
          upNext: obj.status === 'next',
          bidders: obj.bids.map((x: any) => x.user)
        }
      });
      setQueueData(fixed);
      setLoading(false);

    }
    getQueue();
  }, []);
  // {
  //   trackTitle: "Bitcoin ipsum dolor sit amet",
  //   artistName: "Nonce inputs",
  //   feeRate: 10,
  //   playing: false,
  //   upNext: false,
  //   bidders: [
  //     {
  //       firstNym: "Fluffy",
  //       lastNym: "Honeybadger",
  //       color: "teal"
  //     },
  //     {
  //       firstNym: "Fluffy",
  //       lastNym: "Honeybadger",
  //       color: "teal"
  //     }
  //   ]
  // },


  return (
    <>
      <div className="fixed w-full h-full bg-black top-0 left-0 bg-pfm-purple-100">
        <Image src={bokeh3} alt="" width="100" className="object-cover w-full h-full blur-2xl opacity-50" />
      </div>
      { loading ? <LoadingSpinner /> : 

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
      </div> }

      <NavBar activeBtn="queue" />
    </>
  );
}