'use client';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  router.replace('/host/signin');
}
