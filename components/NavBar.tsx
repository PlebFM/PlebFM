'use client';
import Button from './Button';
import {
  ContactsIcon,
  SearchIcon,
} from '@bitcoin-design/bitcoin-icons-react/outline';
import { QueueListIcon } from '@heroicons/react/24/outline';

interface NavBarProps {
  activeBtn?: string;
}

export default function NavBar(props: NavBarProps) {
  const tempFunc = () => {
    alert('test');
  };

  const options = [
    {
      slug: 'profile',
      text: 'Profile',
      icon: <ContactsIcon />,
      href: '/users/profile',
    },
    {
      slug: 'queue',
      text: 'Queue',
      icon: <QueueListIcon />,
      href: '/atl/queue',
    },
    {
      slug: 'search',
      text: 'Search',
      icon: <SearchIcon />,
      href: '/atl',
    },
  ];

  return (
    <nav className="w-full p-8 bg-pfm-purple-300 bg-gradient-to-b from-pfm-purple-300 to-pfm-purple-100 fixed bottom-0 left-0 text-pfm-neutral-800 z-[99]">
      <ul className="flex space-x-16 justify-center">
        {options.map((option, key) => (
          <li key={key}>
            <a
              href={option.href}
              className={
                props.activeBtn && props.activeBtn === option.slug
                  ? 'drop-shadow-glow-white text-white font-medium'
                  : ''
              }
            >
              <span className="w-8 h-8 block mx-auto">{option.icon}</span>
              <span className="tracking-wider">{option.text}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
