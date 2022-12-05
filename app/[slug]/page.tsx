"use client"
// pleb.fm/shiners
// Bidding landing page

import { Customer } from "../../models/Customer";
import { notFound, usePathname } from "next/navigation";
import "../../app/globals.css"
import React from "react";
import Onboarding from "./Onboarding";
import OnboardingIdentity from "./OnboardingIdentity";
import Search from "./Search";
import { getCustomer } from "../../lib/customers";

type Props = { params: {
    slug: string
  },
  searchParams: {}
}

export default function Bidding() {
  const pathName = usePathname()?.replaceAll('/', '');
  const [newUser, setNewUser] = React.useState(true)
  const [userProfile, setUserProfile] = React.useState({firstNym: '', lastNym: '', color: ''})

  const generateUser = async ()=>{
    const result = await fetch('/api/user', {
      method: 'POST',
    })
    const userData = await result.json()
    userData.user.color = userData.user.avatar
    let timer = setTimeout(()=>{
      setUserProfile(userData.user)
      localStorage.setItem('userProfile', JSON.stringify(userData.user))
    }, 1500)
  }

  const setUser = ()=> {
    setNewUser(false)
  }

  const getUserProfileFromLocal = ()=> {
    const userProfileJSON = localStorage.getItem('userProfile')
    if(userProfileJSON) {
      setUserProfile(JSON.parse(userProfileJSON))
      setUser()
    }
  }

  React.useEffect(()=>{
    getUserProfileFromLocal();
  }, []);

  if(newUser && !userProfile.firstNym) {
    return(<Onboarding generateUserFunc={generateUser} />)
  }
  else if(newUser && userProfile.firstNym) {
    return(<OnboardingIdentity userProfile={userProfile} setNewUserFunc={setUser} />)
  }
  else {
    return(<Search />)
  }
}
