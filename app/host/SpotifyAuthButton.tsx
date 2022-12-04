"use client"

import { useSession, signIn, signOut } from 'next-auth/react';

const SpotifyAuthButton = () => {
  const { data: session } = useSession();
  return (
    <>
      <h3>PLEASE SHOW UP</h3>
      <button onClick={() => signIn()}>Sign in</button>
    </>
  ) 


  // if (session) {
  //   return (
  //     <>
  //       <p>Signed in as {session?.user?.email ?? 'Spotify User'}</p> <br />
  //       <button onClick={() => signOut()}>Sign out</button>
  //     </>
  //   );
  // }
  // return (
  //   <>
  //     <p>Not signed in</p><br />
  //     <button onClick={() => signIn()}>Sign in</button>
  //   </>
  // ); 

};

export default SpotifyAuthButton;