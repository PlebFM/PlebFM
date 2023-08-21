import { SongObject } from '../pages/[slug]/queue';

interface TagProps {
  song: SongObject;
  profile?: boolean;
}
export default function Tag(props: TagProps) {
  if (
    !props?.song ||
    !(props.song.playing || props.song.upNext || props.song.myPick)
  )
    return <></>;

  let color = ' ';
  let text = ' ';
  if (props.song.playing) {
    color = 'bg-pfm-orange-700';
    text = 'Now Playing';
  } else if (props.song.upNext) {
    color = 'bg-pfm-teal-700';
    text = 'Up Next';
  } else if (props.song.myPick) {
    color = 'bg-pfm-purple-800';
    text = 'My Pick';
  }

  return (
    <div className="mb-6">
      <span className={'px-2 py-1 text-black font-semibold rounded ' + color}>
        {text}
      </span>
    </div>
  );
}
