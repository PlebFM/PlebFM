import { useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { TeamNameSettings } from './TeamNameSettings';
import { JukeboxUrlSettings } from './JukeboxUrlSettings';
import { DangerZone } from './DangerZone';

type GeneralSettingsProps = {
  hostName: string;
  shortName: string;
  hostId: string;
  baseUrl: string;
};

export function GeneralSettings({
  hostName,
  shortName,
  hostId,
  baseUrl,
}: GeneralSettingsProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <div className="space-y-6">
      <TeamNameSettings hostName={hostName} hostId={hostId} />
      <JukeboxUrlSettings
        shortName={shortName}
        baseUrl={baseUrl}
        hostId={hostId}
      />
      <div>
        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="flex items-center text-white/60 hover:text-white transition-colors"
        >
          <ChevronRightIcon
            className={`w-4 h-4 mr-2 transition-transform ${
              isAdvancedOpen ? 'rotate-90' : ''
            }`}
          />
          Advanced Settings
        </button>

        {isAdvancedOpen && (
          <div className="mt-4">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <DangerZone onDelete={() => console.log('Delete jukebox')} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
