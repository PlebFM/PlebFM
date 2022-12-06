"use client"
import { GetServerSideProps } from "next";
import { Session } from "next-auth";
import { getSession, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { addTrackToQueue, getAccessToken, getPlaybackState, searchTrack } from "../../lib/spotify";
import Queue from "./Queue"
import Login from "./Login"

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   if (context.req.cookies["spotify-token"]) {
//     const token: string = context.req.cookies["spotify-token"];
//     return {
//       props: { token: token },
//     };
//   } else {
//     return {
//       props: { token: "" },
//     };
//   }
// };


export default function Leaderboard() {
  const {data: session} = useSession();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const cbat = "0AzD1FEuvkXP1verWfaZdv";

  useEffect(() => {
    if (!session) return;
    const foo = async () => {
      const accessToken = session.accessToken;
      // const accessToken = await getAccessToken(session.refreshToken);
      console.log('accessToken', accessToken);
      setAccessToken(accessToken);
      const playRes = await getPlaybackState(accessToken);
      console.log('playbackState', playRes);
      await searchTrack('cbat', accessToken, '1').then(x=>{
        console.log(x);
      })
      // await addTrackToQueue('spotify:track:0AzD1FEuvkXP1verWfaZdv', "39e3ac37c47e025896e18e37a168bc8a9dce7149", accessToken).then((res) => console.log(res));

    } 
    foo();
  }, [session]);

  const dummySpotifyAuth = true

  if(dummySpotifyAuth) return (<Queue />)
  else return (<Login />)
}