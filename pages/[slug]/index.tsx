// pleb.fm/shiners
import { usePathname } from 'next/navigation';
import React, { useEffect, useCallback } from 'react';
import Onboarding from '../../components/Onboarding/Onboarding';
import OnboardingIdentity from '../../components/Onboarding/OnboardingIdentity';
import Search from '../../components/Checkout/Search';
import { getHost } from '../../lib/hosts';
import Checkout from '../../components/Checkout/Checkout';
import LoadingSpinner from '../../components/Utils/LoadingSpinner';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Layout from '../../components/Utils/Layout';
import { getUserProfileFromLocal } from '../../utils/profile';

export default function Bidding() {
  const pathName = usePathname()?.replaceAll('/', '');
  const [newUser, setNewUser] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState({
    firstNym: '',
    lastNym: '',
    color: '',
  });
  const [songChoice, setSongChoice] = React.useState('');

  useEffect(() => {
    if (!songChoice) return;
  }, [songChoice]);

  const generateUser = async () => {
    const result = await fetch('/api/user', {
      method: 'POST',
    });
    const userData = await result.json();
    userData.user.color = userData.user.avatar;
    let timer = setTimeout(() => {
      setUserProfile(userData.user);
      localStorage.setItem('userProfile', JSON.stringify(userData.user));
    }, 1500);
  };

  const setUser = () => {
    setNewUser(false);
  };

  React.useEffect(() => {
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
      <Layout>
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
          <Search setSong={setSongChoice} />
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
  const host = await getHost(params?.slug, req.headers.host ?? null);

  if (!host)
    return {
      notFound: true,
      props: { message: 'Jukebox not found!' },
    };
  return {
    props: {},
  };
};
