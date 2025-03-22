import { redirect } from 'next/navigation';
import { auth } from '../../../../utils/auth';
import HostLoginUI from '../../../ui/HostLoginUI';

export default async function LoginPage() {
  const session = await auth();
  if (session) {
    // redirect to /host
    return redirect('/host/dashboard');
  }
  return <HostLoginUI />;
}
