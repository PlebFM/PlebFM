'use client';

import { useEffect, useState } from 'react';
import { User } from '../../models/User';

export const getUserProfileFromLocal = () => {
  const userProfileJSON = localStorage.getItem('userProfile');
  if (userProfileJSON) {
    return JSON.parse(userProfileJSON);
  }
};

export const useProfile = () => {
  const [userProfile, setUserProfile] = useState<User>();

  useEffect(() => {
    const profile = getUserProfileFromLocal();
    if (profile) setUserProfile(profile);
  }, []);

  return { userProfile };
};
