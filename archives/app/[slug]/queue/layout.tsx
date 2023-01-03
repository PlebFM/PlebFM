import NavBar from "../../../components/NavBar"

export interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function QueueLayout({ children }: AccountLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}