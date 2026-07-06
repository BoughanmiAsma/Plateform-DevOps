import React from 'react';

export default function MetricChart({ title, data, type = 'line', color = '#6366f1', valueFormatter = (v) => v }) {
  if (!data || !data.points || data.points.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="chart-title">{title}</span>
          </div>
          <span className="chart-value-large" style={{ color: 'var(--status-success, #10b981)' }}>
            0.00%
          </span>
        </div>
        <div className="chart-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px', gap: '0.5rem' }}>
          <div style={{ fontSize: '1.75rem' }}>🛡️</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500', textAlign: 'center', margin: 0 }}>
            All systems operational.<br />No errors detected.
          </p>
        </div>
      </div>
    );
  }

  const points = data.points;
  const values = points.map(p => p.value);
  const minVal = 0; // Commencer l'axe Y à 0 pour la lisibilité
  const maxVal = Math.max(...values, 1) * 1.1; // 10% au-dessus du max pour de la marge

  const width = 500;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Obtenir les coordonnées X et Y pour chaque point
  const coords = points.map((p, index) => {
    const x = paddingLeft + (index / (points.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((p.value - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, value: p.value, time: new Date(p.timestamp) };
  });

  // Formater l'heure sous forme HH:MM
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Générer le chemin d'accès (Path) SVG de la ligne (avec lissage bezier si type == 'line')
  let pathD = '';
  let areaD = '';

  if (coords.length > 0) {
    if (type === 'line') {
      // Dessiner des courbes de Bézier pour un look premium et fluide
      pathD = `M ${coords[0].x} ${coords[0].y}`;
      for (let i = 0; i < coords.length - 1; i++) {
        const cpX1 = coords[i].x + (coords[i + 1].x - coords[i].x) / 3;
        const cpY1 = coords[i].y;
        const cpX2 = coords[i].x + 2 * (coords[i + 1].x - coords[i].x) / 3;
        const cpY2 = coords[i + 1].y;
        pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${coords[i + 1].x} ${coords[i + 1].y}`;
      }

      // Chemin pour la zone remplie sous la courbe
      areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - paddingBottom} L ${coords[0].x} ${height - paddingBottom} Z`;
    }
  }

  // Id unique pour les dégradés SVG pour éviter les collisions
  const gradId = `grad-${title.replace(/\s+/g, '-').toLowerCase()}`;

  // Valeur actuelle la plus récente
  const latestValue = values[values.length - 1];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="chart-title">{title}</span>
        </div>
        <span className="chart-value-large" style={{ color: color }}>
          {valueFormatter(latestValue)}
        </span>
      </div>

      <div className="chart-body">
        <svg viewBox={`0 0 ${width} ${height}`} className="chart-canvas-mock" style={{ overflow: 'visible' }}>
          <defs>
            {/* Dégradé pour la zone sous la courbe */}
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Lignes de repère (Grille Y) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + ratio * chartHeight;
            const gridVal = maxVal - ratio * (maxVal - minVal);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="var(--border-color)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  fill="var(--text-muted)"
                  fontSize="9px"
                  textAnchor="end"
                  fontFamily="var(--font-sans)"
                >
                  {valueFormatter(gridVal)}
                </text>
              </g>
            );
          })}

          {/* Axe X repères de temps */}
          {coords.filter((_, idx) => idx % 3 === 0 || idx === coords.length - 1).map((c, i) => (
            <text
              key={i}
              x={c.x}
              y={height - 2}
              fill="var(--text-muted)"
              fontSize="9px"
              textAnchor="middle"
              fontFamily="var(--font-sans)"
            >
              {formatTime(c.time)}
            </text>
          ))}

          {/* Rendu du graphique en ligne */}
          {type === 'line' && (
            <>
              {/* Zone remplie en dégradé */}
              <path d={areaD} fill={`url(#${gradId})`} />
              {/* Ligne principale */}
              <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
              {/* Points sur la courbe */}
              {coords.map((c, idx) => (
                <circle
                  key={idx}
                  cx={c.x}
                  cy={c.y}
                  r={idx === coords.length - 1 ? '4' : '2'}
                  fill={color}
                  stroke={idx === coords.length - 1 ? 'var(--bg-secondary)' : 'none'}
                  strokeWidth="2"
                />
              ))}
            </>
          )}

          {/* Rendu du graphique en barres (ex: RPS) */}
          {type === 'bar' && (
            <g>
              {coords.map((c, idx) => {
                const barWidth = Math.max((chartWidth / coords.length) * 0.65, 6);
                const barHeight = (height - paddingBottom) - c.y;
                const barX = c.x - barWidth / 2;
                return (
                  <rect
                    key={idx}
                    x={barX}
                    y={c.y}
                    width={barWidth}
                    height={Math.max(barHeight, 2)}
                    rx={2}
                    fill={color}
                    opacity={0.85}
                    style={{ transition: 'all 0.3s' }}
                  />
                );
              })}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
