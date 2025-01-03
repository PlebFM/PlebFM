import { useState } from 'react';

interface SettingsSectionProps {
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
  helperText?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'danger';
  hasChanges?: boolean;
  onSave?: () => void;
}

export function SettingsSection({
  title,
  description,
  children,
  helperText,
  className = '',
  variant = 'default',
  hasChanges = false,
  onSave,
}: SettingsSectionProps) {
  const borderColor =
    variant === 'danger' ? 'border-red-500/10' : 'border-white/10';
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-medium text-white mb-2">{title}</h2>
      <div
        className={`bg-white/5 rounded-lg border ${borderColor} p-4 ${className}`}
      >
        <div className="space-y-4">
          {children}
          <div className="flex items-center justify-between">
            <div className="text-sm flex-col gap-1 text-white/60">
              <div className="flex flex-col gap-1">
                {description}
                {helperText && (
                  <div className="text-xs text-white/40">{helperText}</div>
                )}
              </div>
            </div>
            {onSave && (
              <div className="flex flex-col items-end gap-1 ml-8">
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className="px-3 py-1 text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:hover:bg-purple-500 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <span
                  className={`text-xs ${
                    hasChanges ? 'text-yellow-400' : 'invisible'
                  }`}
                >
                  Unsaved changes
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
