import { fetchDashboardData } from '../../lib/dashboard';
import { Plans } from '../../ui/Plans';

export default function HostPlans() {
  const data = fetchDashboardData(true);
  console.log('HERERERE');

  return (
    <>
      <main className={`max-w-5xl w-full mx-auto px-4 py-16 flex-1`}>
        <div className="min-h-[calc(100vh-16rem)]">
          <Plans data={data} />
        </div>
      </main>
    </>
  );
}
