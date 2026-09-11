// pleb.fm/shiners
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Onboarding from '../../components/Onboarding/Onboarding';
import OnboardingIdentity from '../../components/Onboarding/OnboardingIdentity';
import Search from '../../components/Checkout/Search';
import { getHost } from '../../lib/hosts';
import Checkout from '../../components/Checkout/Checkout';
import LoadingSpinner from '../../components/Utils/LoadingSpinner';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Layout from '../../components/Utils/Layout';
import { getUserProfileFromLocal } from '../../utils/profile';

export default function Bidding({
  venue,
}: {
  venue: { hostName: string; accentColor: string; welcomeMessage: string };
}) {
  const pathName = usePathname()?.replaceAll('/', '');
  const [newUser, setNewUser] = useState(false);
  const [userProfile, setUserProfile] = useState({
    firstNym: '',
    lastNym: '',
    color: '',
  });
  const [songChoice, setSongChoice] = useState('');

  const generateUser = async () => {
    const result = await fetch('/api/user', {
      method: 'POST',
    });
    const userData = await result.json();
    userData.user.color = userData.user.avatar;
    setTimeout(() => {
      setUserProfile(userData.user);
      localStorage.setItem('userProfile', JSON.stringify(userData.user));
    }, 1500);
  };

  const setUser = () => {
    setNewUser(false);
  };

  useEffect(() => {
    let cancelled = false;
    fetch('/api/user', { method: 'POST' })
      .then(async response => {
        if (!response.ok) throw new Error('Could not create your profile');
        const { user } = await response.json();
        if (cancelled) return;
        localStorage.setItem('userProfile', JSON.stringify(user));
        setUserProfile(user);
        setNewUser(false);
      })
      .catch(() => {
        if (!cancelled) setNewUser(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!newUser && !userProfile.firstNym) {
    return (
      <Layout title="Loading">
        <LoadingSpinner />
      </Layout>
    );
  } else if (newUser && !userProfile.firstNym) {
    return (
      <Layout title="Welcome">
        <Onboarding generateUserFunc={generateUser} />
      </Layout>
    );
  } else if (newUser && userProfile.firstNym) {
    return (
      <Layout
        title={'Welcome, ' + userProfile.firstNym + ' ' + userProfile.lastNym}
      >
        <OnboardingIdentity
          userProfile={userProfile}
          setNewUserFunc={setUser}
        />
      </Layout>
    );
  } else {
    if (songChoice.length > 0)
      return (
        <Layout title="Checkout">
          <Checkout
            song={JSON.parse(songChoice)}
            parentCallback={setSongChoice}
            slug={pathName || ''}
          />
        </Layout>
      );
    else {
      return (
        <Layout title="Song Search">
          <div
            className="px-6 pt-6 text-center"
            style={{ color: venue.accentColor }}
          >
            <h1 className="text-2xl">{venue.hostName}</h1>
            {venue.welcomeMessage && <p>{venue.welcomeMessage}</p>}
          </div>
          <Search selectSong={setSongChoice} />
        </Layout>
      );
    }
  }
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { params, req } = context;
  if (!params?.slug)
    return {
      notFound: true,
      props: { message: 'Jukebox not found!' },
    };

  //@ts-ignore
  const { ensureDB } = await import('../../lib/db');
  const { default: Hosts } = await import('../../models/Host');
  const { publicHost } = await import('../../lib/public-host');
  await ensureDB();
  const host = await Hosts.findOne({ shortName: params.slug, deletedAt: null });

  if (!host)
    return {
      notFound: true,
      props: { message: 'Jukebox not found!' },
    };
  const { planForHost } = await import('../../lib/subscriptions');
  const venue = publicHost(host);
  if ((await planForHost(host.hostId)).id !== 'pro') {
    venue.accentColor = undefined;
    venue.welcomeMessage = undefined;
  }
  return {
    props: { venue: JSON.parse(JSON.stringify(venue)) },
  };
};
