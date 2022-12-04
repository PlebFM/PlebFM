import Image from "next/image";

interface AvatarProps {
  firstNym?: string,
  lastNym?: string,
  color?: string
}

export default function Avatar(props:AvatarProps){
  let color = "bg-pfm-neutral-600"
  let imageSrc = "Loading"

  const colorMap = {
    'tealLight': 'bg-pfm-teal-800',
    'teal': 'bg-pfm-teal-500',
    'tealDark': 'bg-pfm-teal-200',
    'orangeLight': 'bg-pfm-orange-800',
    'orange': 'bg-pfm-orange-500',
    'orangeDark': 'bg-pfm-orange-200',
    'purpleLight': 'bg-pfm-purple-800',
    'purple': 'bg-pfm-purple-500',
    'purpleDark': 'bg-pfm-purple-200',
  }

  if(props.color) color = colorMap[props.color as keyof typeof colorMap]

  if(props.lastNym) imageSrc = props.lastNym

  return(
    <>
      <div className="rounded-full bg-white/20 p-4 w-full">
        <div className={"rounded-full overflow-hidden w-full h-auto " + color}>
          <Image
            src={"/Avatar/" + imageSrc + ".png"}
            alt={props.firstNym + " " + props.lastNym}
            width="180"
            height="180"
            quality="100"
            blurDataURL={"/Avatar/" + imageSrc + "-blur.png"}
            placeholder="blur"
            className="object-cover w-full"
          />
        </div>
      </div>
    </>
  )
}