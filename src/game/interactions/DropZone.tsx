import type { ReactNode } from 'react';

type Props = {
  targetId: string;
  label: string;
  selectedItemId: string | null;
  occupied: boolean;
  highlighted?: boolean;
  onPlaceSelected: (targetId: string) => void;
  children?: ReactNode;
};

export function DropZone({ targetId, label, selectedItemId, occupied, highlighted = false, onPlaceSelected, children }: Props) {
  return (
    <button
      type="button"
      className={`drop-zone ${selectedItemId ? 'drop-zone--ready' : ''} ${highlighted ? 'drop-zone--compatible' : ''} ${occupied ? 'drop-zone--occupied' : ''}`}
      data-drop-target={targetId}
      aria-label={`${label}${occupied ? ' — emplacement occupé' : selectedItemId ? ' — déposer ici' : ''}`}
      aria-disabled={occupied}
      onClick={() => { if (selectedItemId && !occupied) onPlaceSelected(targetId); }}
    >
      {children}
    </button>
  );
}
