import { SettingsSection } from './SettingsSection';

interface DangerZoneProps {
  onDelete?: () => void;
}

export function DangerZone({ onDelete }: DangerZoneProps) {
  return (
    <SettingsSection
      title="Danger Zone"
      description="Irreversible and destructive actions."
      variant="danger"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">Delete Jukebox</h3>
          <p className="text-sm text-white/60">
            Permanently delete your jukebox and all of its data.
          </p>
        </div>
        <button
          onClick={onDelete}
          className="px-4 py-2 text-sm font-medium text-white bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>
    </SettingsSection>
  );
}
