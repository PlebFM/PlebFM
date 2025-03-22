import { useState } from 'react';
import toast from 'react-hot-toast';
import { SettingsSection } from './SettingsSection';
import { revalidatePath } from 'next/cache';

type JukeboxUrlSettingsProps = {
  shortName: string;
  baseUrl: string;
  hostId: string;
};

export function JukeboxUrlSettings({
  shortName,
  baseUrl,
  hostId,
}: JukeboxUrlSettingsProps) {
  const [currentValue, setCurrentValue] = useState(shortName);
  const hasChanges = currentValue !== shortName;

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
          shortName: currentValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update jukebox URL');
      }

      revalidatePath('/host/dashboard/settings');
      return response.json();
    };

    return toast.promise(savePromise(), {
      loading: 'Saving...',
      success: 'Jukebox URL updated successfully',
      error: 'Failed to update jukebox URL',
    });
  };

  return (
    <SettingsSection
      title="Jukebox URL"
      description="Your jukebox's unique URL where customers can request songs."
      hasChanges={hasChanges}
      onSave={handleSave}
      helperText="This should be short and unique."
    >
      <div className="flex rounded-md">
        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-white/10 bg-white/5 text-white/40 text-sm">
          {baseUrl}/
        </span>
        <input
          type="text"
          value={currentValue}
          onChange={e => handleChange(e.target.value)}
          className="block w-full bg-black border border-white/10 rounded-none rounded-r-md px-3 py-2 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="your-jukebox-name"
        />
      </div>
    </SettingsSection>
  );
}
