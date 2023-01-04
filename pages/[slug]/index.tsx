// pleb.fm/shiners
// Bidding landing page

// import { Host } from "../models/Host";
import { notFound, usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import Onboarding from '../../components/Onboarding';
import OnboardingIdentity from '../../components/OnboardingIdentity';
import Search from '../../components/Search';
import { getHost, getHosts } from '../../lib/hosts';
import Checkout from '../../components/Checkout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';

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
    return <LoadingSpinner />;
  } else if (newUser && !userProfile.firstNym) {
    return <Onboarding generateUserFunc={generateUser} />;
  } else if (newUser && userProfile.firstNym) {
    return (
      <OnboardingIdentity userProfile={userProfile} setNewUserFunc={setUser} />
    );
  } else {
    if (songChoice.length > 0)
      return (
        <Checkout
          song={JSON.parse(songChoice)}
          parentCallback={setSongChoice}
          slug={pathName || ''}
        />
      );
    else return <Search setSong={setSongChoice} />;
  }
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { params } = context;
  if (!params?.slug)
    return {
      notFound: true,
      props: { message: 'Jukebox not found!' },
    };

  //@ts-ignore
  const host = await getHost(params?.slug);

  if (!host)
    return {
      notFound: true,
      props: { message: 'Jukebox not found!' },
    };
  return {
    props: {},
  };
};
