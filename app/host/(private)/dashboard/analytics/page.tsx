import { memo } from 'react';
import { Suspense } from 'react';
import LoadingSpinner from '../../../../../components/Utils/LoadingSpinner';
import { DashboardContentWrapper } from '../../../../ui/DashboardContentWrapper';

const AnalyticsContent = memo(function AnalyticsContent() {
  return (
    <div className="text-white">
      {/* Analytics content will go here */}
      Coming soon...
    </div>
  );
});

export default function HostAnalytics() {
  return (
    <Suspense
      fallback={<LoadingSpinner background="black h-[calc(100vh-20rem)]" />}
    >
      <DashboardContentWrapper
        title="Analytics"
        subtitle="Track your jukebox performance and earnings."
        margin="large"
      >
        <AnalyticsContent />
      </DashboardContentWrapper>
    </Suspense>
  );
}
