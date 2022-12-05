"use client"
// pleb.fm/shiners
// Bidding landing page

import { Customer } from "../../models/Customer";
import { notFound } from "next/navigation";
import SearchBox from "./SearchBox";
import "../../app/globals.css"
import React from "react";
import Onboarding from "./Onboarding";
import OnboardingIdentity from "./OnboardingIdentity";
import Search from "./Search";

type Props = { params: {
    slug: string
  },
  searchParams: {}
}

const getCustomers = async (): Promise<Customer[]> => {
  const res = await fetch("http://0.0.0.0:3000/api/customers", {
    method: 'GET',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });
  if (!res.ok) throw new Error('unable to fetch data');
  const customers = await res.json();
  return customers.customers;
}
const getCustomer = async (slug: string): Promise<Customer> => {
  const res = await fetch(`http://0.0.0.0:3000/api/customers/${slug}`, {
    method: 'GET',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });
  if (!res.ok) notFound();
  const customer = await res.json();
  return customer.customer;
}

export default function Bidding() {
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

  const setUser = ()=>{
    setNewUser(false)
  }

  const getUserProfileFromLocal = ()=>{
    let userProfileJSON = localStorage.getItem('userProfile')
    if(userProfileJSON) {
      setUserProfile(JSON.parse(userProfileJSON))
      setUser()
    }
  }

  React.useEffect(()=>{
    getUserProfileFromLocal()
  }, [])

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

export async function generateStaticParams() {
  const customers: Customer[] = await getCustomers();
  console.error(customers);
  // return customers;

  return customers.map((customer: Customer) => {
    return { slug: customer.shortName };
  });
}
