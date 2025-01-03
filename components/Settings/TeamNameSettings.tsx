import { useState } from 'react';
import toast from 'react-hot-toast';
import { SettingsSection } from './SettingsSection';

interface TeamNameSettingsProps {
  hostName: string;
}

export function TeamNameSettings({ hostName }: TeamNameSettingsProps) {
  const [currentValue, setCurrentValue] = useState(hostName);
  const hasChanges = currentValue !== hostName;

  const handleChange = (value: string) => {
    setCurrentValue(value);
  };

  const handleSave = async () => {
    toast.promise(
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (currentValue.length > 0) {
            resolve(currentValue);
          } else {
            reject(new Error('Invalid URL'));
          }
        }, 1000);
      }),
      {
        loading: 'Saving...',
        success: 'Jukebox URL updated successfully',
        error: 'Failed to update jukebox URL',
      },
    );
  };

  return (
    <SettingsSection
      title="Team Name"
      description="This is your jukebox's visible name to your customers."
      hasChanges={hasChanges}
      onSave={handleSave}
      helperText="Please use 32 characters at maximum."
    >
      <input
        type="text"
        value={currentValue}
        onChange={e => handleChange(e.target.value)}
        className="block w-full bg-black border border-white/10 rounded-md px-3 py-2 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        placeholder="Enter your jukebox name"
      />
    </SettingsSection>
  );
}
