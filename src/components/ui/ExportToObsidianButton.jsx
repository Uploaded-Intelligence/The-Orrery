// src/components/ui/ExportToObsidianButton.jsx
import { Upload } from 'lucide-react';
import { useOrrery } from '@/store';
import { stateToObsidianManifest } from '@/utils/toObsidian';
import { downloadJson } from '@/utils/exportState';
import { COLORS } from '@/constants';

/**
 * Export state in Obsidian-compatible format
 */
export function ExportToObsidianButton() {
  const { state } = useOrrery();

  const handleExport = () => {
    const manifest = stateToObsidianManifest(state);
    const json = JSON.stringify(manifest, null, 2);
    downloadJson(json, `orrery-to-obsidian-${Date.now()}.json`);
  };

  return (
    <button
      onClick={handleExport}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        background: COLORS.bgElevated,
        border: `1px solid ${COLORS.accentSecondary}`,
        borderRadius: '6px',
        color: COLORS.accentSecondary,
        fontSize: '13px',
        cursor: 'pointer',
      }}
      title="Export to Obsidian format"
    >
      <Upload size={16} />
      To Obsidian
    </button>
  );
}
