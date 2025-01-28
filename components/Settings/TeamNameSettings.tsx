'use client';

import { revalidatePath } from 'next/cache';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { SettingsSection } from './SettingsSection';

type TeamNameSettingsProps = {
  hostName: string;
  hostId: string;
};

export function TeamNameSettings({ hostName, hostId }: TeamNameSettingsProps) {
  const [currentValue, setCurrentValue] = useState(hostName);
  const hasChanges = currentValue !== hostName;

  const handleChange = (value: string) => {
    setCurrentValue(value);
  };

  const handleSave = async () => {
    const savePromise = async () => {
      const response = await fetch('/api/hosts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spotifyId: hostId,
          hostName: currentValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update team name');
      }

      // TODO: add refresh
      revalidatePath('/host/dashboard/settings');

      return response.json();
    };

    return toast.promise(savePromise(), {
      loading: 'Saving...',
      success: 'Team name updated successfully',
      error: 'Failed to update team name',
    });
  };

  return (
    <SettingsSection
      title="Team Name"
      description="This is your team's display name."
      hasChanges={hasChanges}
      onSave={handleSave}
      helperText="This name will be shown to your customers."
    >
      <input
        type="text"
        value={currentValue}
        onChange={e => handleChange(e.target.value)}
        className="block w-full bg-black border border-white/10 rounded-md px-3 py-2 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        placeholder="Your Team Name"
      />
    </SettingsSection>
  );
}
