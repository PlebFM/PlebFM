'use client';
import Button from './Button';
import {
  ContactsIcon,
  SearchIcon,
} from '@bitcoin-design/bitcoin-icons-react/outline';
import { QueueListIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavBarProps {
  activeBtn?: string;
}

export default function NavBar(props: NavBarProps) {
  const tempFunc = () => {
    alert('test');
  };
  const pathname = usePathname();
  const [host, setHost] = useState<string>();

  useEffect(() => {
    if (!pathname) return;
    const _host = pathname.substring(1).split('/')[0];
    setHost(_host);
  }, [pathname]);

  const options = [
    {
      slug: 'profile',
      text: 'Profile',
      icon: <ContactsIcon />,
      href: `/${host}/profile`,
    },
    {
      slug: 'queue',
      text: 'Queue',
      icon: <QueueListIcon />,
      href: `/${host}/queue`,
    },
    {
      slug: 'search',
      text: 'Search',
      icon: <SearchIcon />,
      href: `/${host}`,
    },
  ];

  return (
    <nav className="font-normal text-sm w-full p-2 bg-pfm-purple-300 bg-gradient-to-b from-pfm-purple-300 to-pfm-purple-100 fixed bottom-0 left-0 text-pfm-neutral-800 z-[99]">
      <ul className="flex space-x-16 justify-center">
        {options.map((option, key) => (
          <li key={key}>
            <a
              href={option.href}
              className={
                props.activeBtn && props.activeBtn === option.slug
                  ? 'drop-shadow-glow-white text-white font-bold'
                  : ''
              }
            >
              <span className="w-6 h-6 block mx-auto">{option.icon}</span>
              <span className="tracking-wider">{option.text}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
