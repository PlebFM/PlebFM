// pleb.fm/shiners
// Bidding landing page
// import { Host } from "../models/Host";
import { notFound, usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import Onboarding from '../../components/Onboarding';
import OnboardingIdentity from '../../components/OnboardingIdentity';
import Search from '../../components/Search';
import { getHost, getHosts } from '../../lib/hosts';
import { updateFeed } from '../../lib/feed';
import Checkout from '../../components/Checkout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Layout from '../../components/Layout';

type Props = {
  params: {
    slug: string;
  };
  searchParams: {};
};

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
    console.log('SONG', JSON.parse(songChoice));
  }, [songChoice]);

  const generateUser = async () => {
    const result = await fetch('/api/user', {
      method: 'POST',
    });
    const userData = await result.json();
    userData.user.color = userData.user.avatar;
    const update = await updateFeed('join', pathName, userData.userId);
    if (!update) console.log('Error');
    console.log(update);
    let timer = setTimeout(() => {
      setUserProfile(userData.user);
      localStorage.setItem('userProfile', JSON.stringify(userData.user));
    }, 1500);
  };

  const setUser = () => {
    setNewUser(false);
  };

  const getUserProfileFromLocal = () => {
    const userProfileJSON = localStorage.getItem('userProfile');
    if (userProfileJSON) {
      setUserProfile(JSON.parse(userProfileJSON));
      setUser();
    } else setNewUser(true);
  };

  React.useEffect(() => {
    getUserProfileFromLocal();
  }, []);

  const handleSongChoice = (songChoice: string) => {
    setSongChoice(songChoice);
  };

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
