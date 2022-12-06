import Button from "./Button"
import {ContactsIcon, SearchIcon} from "@bitcoin-design/bitcoin-icons-react/outline"

interface NavBarProps {
  activeBtn?: string
}

export default function NavBar(props:NavBarProps){
  const tempFunc = ()=>{alert('test')}

  const options = [
    {
      slug: 'profile',
      text: 'Profile',
      icon: <ContactsIcon />,
      onClick: tempFunc
    },
    {
      slug: 'queue',
      text: 'Queue',
      icon: <ContactsIcon />,
      onClick: tempFunc
    },
    {
      slug: 'search',
      text: 'Search',
      icon: <SearchIcon />,
      onClick: tempFunc
    },
  ]

  return(
    <nav className="w-full p-8 bg-pfm-purple-300 bg-gradient-to-b from-pfm-purple-300 to-pfm-purple-100 fixed bottom-0 left-0 text-pfm-neutral-800 z-[99]">
      <ul className="flex space-x-16 justify-center">
        {options.map((option, key)=>(
          <li key={key}>
            <button onClick={option.onClick} className={props.activeBtn && props.activeBtn === option.slug ? "drop-shadow-glow-white text-white font-medium" : ""}>
              <span className="w-8 h-8 block mx-auto">{option.icon}</span>
              <span className="tracking-wider">{option.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}