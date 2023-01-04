/* eslint-disable @next/next/no-head-element */

export default function PlebLayout({ children, }: { children: React.ReactNode; }) {
  return (
    <>
      <section>{children}</section>
    </>
  );

}