interface BoopProps {
    active?: boolean
}
export default function Boop(props:BoopProps){
    return(
        <span className={props.active ? "opacity-1" : "opacity-50"}>
            <span className="w-1.5 h-1.5 bg-white block rounded-full"></span>
        </span>

    )
}