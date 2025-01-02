import Link from 'next/link';

interface JukeboxLinkProps {
  href: string;
  children: string;
}

export default function JukeboxLink({ href, children }: JukeboxLinkProps) {
  return (
    <li>
      <Link
        href={href}
        className="text-orange-300 hover:text-orange-200 block truncate"
      >
        {children}
      </Link>
    </li>
  );
}
