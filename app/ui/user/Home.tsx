'use client';

// pleb.fm/shiners
import { usePathname } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import Onboarding from '../../../components/Onboarding/Onboarding';
import OnboardingIdentity from '../../../components/Onboarding/OnboardingIdentity';
import Search from '../../../components/Checkout/Search';
import Checkout from '../../../components/Checkout/Checkout';
import LoadingSpinner from '../../../components/Utils/LoadingSpinner';
import Layout from '../../../components/Utils/Layout';
import { getUserProfileFromLocal } from '../../../utils/profile';
import { Host } from '../../../models/Host';

export const Home = ({ host: _host }: { host: Promise<void | Host> }) => {
  const host = use(_host);
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
    const profile = getUserProfileFromLocal();
    if (profile) {
      setUserProfile(profile);
      setUser();
    } else {
      setNewUser(true);
    }
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
          <Search selectSong={setSongChoice} />
        </Layout>
      );
    }
  }
};

// export const getServerSideProps: GetServerSideProps = async (
//   context: GetServerSidePropsContext,
// ) => {
//   const { params, req } = context;
//   if (!params?.slug)
//     return {
//       notFound: true,
//       props: { message: 'Jukebox not found!' },
//     };

//   //@ts-ignore
//   const host = await getHost(params?.slug, req.headers.host ?? null);

//   if (!host)
//     return {
//       notFound: true,
//       props: { message: 'Jukebox not found!' },
//     };
//   return {
//     props: {},
//   };
// };
