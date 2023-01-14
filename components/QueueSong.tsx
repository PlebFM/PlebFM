import Tag from './Tag';
import Avatar from './Avatar';
import electricity01 from '../public/electricity-01.svg';
import electricity02 from '../public/electricity-02.svg';
import Image from 'next/image';

interface QueueSongProps {
  trackTitle: string;
  artistName: string;
  feeRate: number;
  playing?: boolean;
  upNext?: boolean;
  boosted?: boolean;
  bidders: {
    firstNym: string;
    lastNym: string;
    color: string;
  }[];
}

export default function QueueSong(props: QueueSongProps) {
  return (
    <div
      className={
        'p-6 border-b border-white/20 w-full bg-pfm-purple-300/50 relative overflow-x-clip overflow-y-visible' +
        (props.boosted ? ' shadow-glow-white' : '')
      }
    >
      {props.playing || props.upNext ? (
        <div className="mb-6">
          <Tag
            text={
              props.playing ? 'Now Playing' : props.upNext ? 'Up Next' : ' '
            }
            color={props.playing ? 'orange' : props.upNext ? 'teal' : ' '}
          />
        </div>
      ) : (
        ``
      )}
      <div className="w-full flex justify-between space-x-4 w-full">
        <div className="flex flex-col space-y-2">
          <div>
            <p>{props.trackTitle}</p>
            <p className="font-bold">{props.artistName}</p>
          </div>
          <div className="flex -space-x-1 items-center">
            {/* TODO: Add fetching of user object for bids using SWR */}
            {props.bidders.length == 0 ? (
              <p>user pics</p>
            ) : (
              (props.bidders.length > 5
                ? props.bidders.slice(0, 5)
                : props.bidders
              ).map((bidder, key) => (
                <div className="w-8" key={key}>
                  <Avatar
                    firstNym={bidder.firstNym}
                    lastNym={bidder.lastNym}
                    color={bidder.color}
                    size="xs"
                  />
                </div>
              ))
            )}
            {props.bidders.length > 5 ? (
              <div className="pl-4 font-semibold text-lg">
                +{props.bidders.length - 5}
              </div>
            ) : (
              ``
            )}
          </div>
        </div>
        <p className="font-bold">{props.feeRate} sats</p>
      </div>
      {props.boosted ? (
        <>
          <div className="-top-[40%] w-full h-full absolute block left-0 opacity-10 animate-electric-slide-1 z-50">
            <Image src={electricity01} alt="" width={200} />
          </div>
          <div className="-top-[40%] w-full h-full absolute block left-0 opacity-10 animate-electric-slide-2 z-50">
            <Image src={electricity02} alt="" width={200} />
          </div>
          <div className="-top-[40%] w-full h-full absolute block left-0 opacity-10 animate-electric-slide-3 z-50">
            <Image src={electricity01} alt="" width={200} />
          </div>
          <div className="-top-[40%] w-full h-full absolute block left-0 opacity-10 animate-electric-slide-4 z-50">
            <Image src={electricity02} alt="" width={200} />
          </div>
        </>
      ) : (
        ``
      )}
    </div>
  );
}
