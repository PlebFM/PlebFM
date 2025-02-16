import { Footer } from '../../ui/Footer';
import { auth } from '../../../utils/auth';
import { Header } from '../../ui/Header';

export default async function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header
        hostName={session?.user?.name}
        shortName={session?.user?.shortName}
        loggedIn={!!session}
      />
      <main className="min-h-[calc(100vh-8rem)]">{children}</main>
      <Footer />
    </div>
  );
}
