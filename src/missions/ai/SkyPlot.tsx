import type { ClassificationResult, Observation } from '../../game/classifier';

type Props = {
  training: readonly Observation[];
  selected?: Observation;
  result?: ClassificationResult;
  showUnknown?: boolean;
  showLines?: boolean;
  showNeighbors?: boolean;
  onExample?: (id: string) => void;
};

export function SkyPlot({ training, selected, result, showUnknown = true, showLines = false, showNeighbors = false, onExample }: Props) {
  const neighborIds = new Set(showNeighbors ? result?.neighbors.map(({ observation }) => observation.id) : []);
  return <div className="ai-plot-wrap">
    <div className="ai-plot" role="group" aria-label="Carte du ciel : luminosité de 0 à 10 horizontalement et régularité de 0 à 10 verticalement">
      <span className="ai-axis ai-axis--x">Luminosité →</span><span className="ai-axis ai-axis--y">Régularité ↑</span>
      {showLines && selected && result?.neighbors.map(({ observation }) => {
        const dx = (observation.brightness - selected.brightness) * 10;
        const dy = (selected.regularity - observation.regularity) * 10;
        return <i key={`line-${observation.id}`} className="ai-distance-line" style={{ left: `${selected.brightness * 10}%`, bottom: `${selected.regularity * 10}%`, width: `${Math.hypot(dx, dy)}%`, transform: `rotate(${Math.atan2(dy, dx)}rad)` }} aria-hidden="true" />;
      })}
      {training.map((item) => <button key={item.id} type="button" className={`ai-point ai-point--${item.label} ${neighborIds.has(item.id) ? 'is-neighbor' : ''}`} style={{ left: `${item.brightness * 10}%`, bottom: `${item.regularity * 10}%` }} onClick={() => onExample?.(item.id)} aria-label={`${item.name}, ${item.label}, luminosité ${item.brightness}, régularité ${item.regularity}`}><span aria-hidden="true">{item.label === 'signal' ? '★' : '◆'}</span><small>{item.name}</small></button>)}
      {showUnknown && selected && <span className="ai-point ai-point--unknown" style={{ left: `${selected.brightness * 10}%`, bottom: `${selected.regularity * 10}%` }} aria-label={`${selected.name}, luminosité ${selected.brightness}, régularité ${selected.regularity}`}><span aria-hidden="true">◎</span><small>{selected.name}</small></span>}
    </div>
    <p className="ai-plot-description">De gauche à droite : luminosité. De bas en haut : régularité. ★ signal intéressant, ◆ parasite, ◎ observation inconnue.</p>
  </div>;
}
