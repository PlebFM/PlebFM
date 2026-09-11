'use client';
import { use } from 'react';
import { Checkout } from '@moneydevkit/nextjs';
export default function CheckoutPage({ params }) {
  const { id } = use(params);
  return <Checkout id={id} />;
}
