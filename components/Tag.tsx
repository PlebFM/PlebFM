interface TagProps {
  color?: string;
  text: string;
}
export default function Tag(props: TagProps) {
  let color =
    props.color === 'purple'
      ? 'bg-pfm-purple-800'
      : props.color === 'teal'
      ? 'bg-pfm-teal-700'
      : 'bg-pfm-orange-700';

  return (
    <>
      <span className={'px-2 py-1 text-black font-semibold rounded ' + color}>
        {props.text}
      </span>
    </>
  );
}
