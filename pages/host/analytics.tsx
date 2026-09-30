import { getServerSidePropsForDashboard } from '../../lib/dashboard-props';
import {
  DashboardLayout,
  DashboardPageProps,
} from '../../components/Dashboard/HostDashboardLayout';
export default function Analytics({ host, stats }: DashboardPageProps) {
  if (!host) return null;
  return (
    <DashboardLayout
      host={host}
      title="Analytics"
      subtitle="Settled bids over the last 30 days (UTC)."
      margin="large"
    >
      <div className="text-white space-y-6">
        <p>
          {stats.receivedSats.toLocaleString()} sats received ·{' '}
          {stats.earnedSats.toLocaleString()} sats earned
        </p>
        {stats.daily.length === 0 ? (
          <p className="text-white/60">
            No paid bids yet. Share your jukebox to get started.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Date</th>
                <th>Paid bids</th>
                <th>Sats received</th>
                <th>Sats earned</th>
              </tr>
            </thead>
            <tbody>
              {stats.daily.map(day => (
                <tr className="border-b border-white/10" key={day._id}>
                  <td className="py-3">{day._id}</td>
                  <td>{day.bids}</td>
                  <td>{day.sats.toLocaleString()}</td>
                  <td>{day.earnedSats.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="text-sm text-white/50">
          Earnings include bids placed while Pro was active, after payment fees.
          Historical bids before payment accounting was enabled are not
          included.
        </p>
      </div>
    </DashboardLayout>
  );
}
export const getServerSideProps = getServerSidePropsForDashboard;
