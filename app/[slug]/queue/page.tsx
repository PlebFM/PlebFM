// "use client"
import Link from "next/link";

// pleb.fm/bantam/queue
export default function Queue() {
  return (
    <>
      <h1>queue, blocked by auth</h1>
        <Link href={'/api/spotify/auth'}>
          spotify login
        </Link>
    </>
  );
}