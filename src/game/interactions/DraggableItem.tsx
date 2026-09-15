import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

type Props = {
  itemId: string;
  selected: boolean;
  dragging: boolean;
  locked: boolean;
  errorNonce?: number;
  onSelect: (itemId: string) => void;
  onDragStart: (itemId: string) => void;
  onDragEnd: () => void;
  onDrop: (itemId: string, targetId: string) => void;
  children: ReactNode;
};

export function DraggableItem({ itemId, selected, dragging, locked, errorNonce = 0, onSelect, onDragStart, onDragEnd, onDrop, children }: Props) {
  const start = useRef<{ x: number; y: number; dragging: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  function pointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (locked || (event.pointerType === 'mouse' && event.button !== 0)) return;
    start.current = { x: event.clientX, y: event.clientY, dragging: false };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function pointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!start.current || locked) return;
    const x = event.clientX - start.current.x;
    const y = event.clientY - start.current.y;
    if (!start.current.dragging && Math.hypot(x, y) > 6) {
      start.current.dragging = true;
      onDragStart(itemId);
    }
    if (start.current.dragging) {
      event.preventDefault();
      setOffset({ x, y });
    }
  }

  function pointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!start.current) return;
    const wasDragging = start.current.dragging;
    start.current = null;
    setOffset({ x: 0, y: 0 });
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (!wasDragging) return;
    suppressClick.current = true;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-drop-target]');
    if (target?.dataset.dropTarget) onDrop(itemId, target.dataset.dropTarget);
    else onDragEnd();
  }

  return (
    <button
      key={`${itemId}-${errorNonce}`}
      type="button"
      className={`manipulable ${selected ? 'manipulable--selected' : ''} ${dragging ? 'manipulable--dragging' : ''} ${locked ? 'manipulable--locked' : ''} ${errorNonce ? 'manipulable--error' : ''}`}
      style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
      aria-pressed={selected}
      aria-disabled={locked}
      data-item-id={itemId}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={() => { start.current = null; setOffset({ x: 0, y: 0 }); onDragEnd(); }}
      onClick={() => {
        if (suppressClick.current) { suppressClick.current = false; return; }
        onSelect(itemId);
      }}
    >
      {children}
      {locked && <span className="manipulable__state">✓ Installé</span>}
      {!locked && selected && <span className="manipulable__state">Sélectionné</span>}
    </button>
  );
}
