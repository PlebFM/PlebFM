// import { Footer } from '../../ui/Footer';
// import { auth } from '../../../utils/auth';
// import { Header } from '../../ui/Header';

export default async function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const session = await auth();
  return (
    <>
      {/* <Header
        hostName={session?.user?.name}
        shortName={session?.user?.shortName}
        loggedIn={!!session} */}
      {/* /> */}
      {children}
      {/* <Footer /> */}
    </>
  );
}
