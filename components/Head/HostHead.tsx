import Head from 'next/head';

interface HostHeadProps {
  title: string;
}

export default function HostHead({ title }: HostHeadProps) {
  return (
    <Head>
      <title>{title} - PlebFM</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  );
}
