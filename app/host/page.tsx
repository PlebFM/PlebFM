"use client"
import { WebPlayback } from "../../components/SpotifyPlayback";
import SpotifyAuthButton from "./SpotifyAuthButton";

export default function Login() {
  return (
    <div>
      <h1>Host Login</h1>
      <SpotifyAuthButton />
      <WebPlayback />
    </div>
  );
}