'use client';

import { use, useEffect, useState } from 'react';
import { Host } from '../../../models/Host';
import { usePathname } from 'next/navigation';
import Layout from '../../../components/Utils/Layout';
import Onboarding from '../../../components/Onboarding/Onboarding';
import OnboardingIdentity from '../../../components/Onboarding/OnboardingIdentity';
import Search from '../../../components/Checkout/Search';
import Checkout from '../../../components/Checkout/Checkout';
import { getUserProfileFromLocal } from '@/utils/profile';
import LoadingSpinner from '@/components/Utils/LoadingSpinner';

// This component handles the flow routing based on user state
export default function FlowRouter({
  host: hostPromise,
}: {
  host: Promise<Host | void>;
}) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState(false);

  const host = use(hostPromise);

  if (!host) {
    throw new Error('Host not found');
  }

  useEffect(() => {
    // Load user profile from localStorage
    const profile = getUserProfileFromLocal();
    if (profile) {
      setUserProfile(profile);
      setNewUser(false);
    } else {
      setNewUser(true);
    }
    setLoading(false);
  }, []);

  const pathName = usePathname()?.replaceAll('/', '');
  const [songChoice, setSongChoice] = useState('');

  // Function to generate a new user profile
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

  // Function to set user as no longer new
  const setUser = () => {
    setNewUser(false);
  };

  if (loading) {
    return (
      <Layout title="Loading">
        <LoadingSpinner />
      </Layout>
    );
  }

  // Route to the appropriate screen based on user state
  if (newUser && !userProfile?.firstNym) {
    return (
      <Layout title="Welcome">
        <Onboarding generateUserFunc={generateUser} />
      </Layout>
    );
  } else if (newUser && userProfile?.firstNym) {
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
    // User is onboarded, show jukebox flow
    if (songChoice.length > 0) {
      return (
        <Layout title="Checkout">
          <Checkout
            song={JSON.parse(songChoice)}
            parentCallback={setSongChoice}
            slug={pathName || ''}
          />
        </Layout>
      );
    } else {
      return (
        <Layout title="Song Search">
          <Search selectSong={setSongChoice} />
        </Layout>
      );
    }
  }
}
