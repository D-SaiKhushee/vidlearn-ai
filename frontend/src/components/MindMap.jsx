import React, { useMemo } from 'react';

const NODE_W = 140;
const NODE_H = 40;
const H_GAP  = 60;
const V_GAP  = 14;

const COLORS = ['#00e5ff', '#7c6cfc', '#00d68f', '#ffb547', '#ff4d6d'];

function buildLayout(node, depth = 0, colorIdx = 0) {
  const color = COLORS[colorIdx % COLORS.length];
  const children = (node.children || []).map((child, i) =>
    buildLayout(child, depth + 1, colorIdx + i + 1)
  );

  const totalChildH = children.reduce((s, c) => s + c.totalH, 0)
    + Math.max(0, children.length - 1) * V_GAP;
  const totalH = Math.max(NODE_H, totalChildH);

  return { label: node.label, color, depth, children, totalH };
}

function calcPositions(node, x, y, positions = []) {
  const cx = x;
  const cy = y + node.totalH / 2;

  positions.push({ label: node.label, color: node.color, x: cx, y: cy });

  let childY = y;
  node.children.forEach(child => {
    calcPositions(child, x + NODE_W + H_GAP, childY, positions);
    const childCX = x + NODE_W + H_GAP;
    const childCY = childY + child.totalH / 2;
    positions.push({ type: 'edge', x1: cx + NODE_W / 2, y1: cy, x2: childCX - NODE_W / 2, y2: childCY, color: child.color });
    childY += child.totalH + V_GAP;
  });

  return positions;
}

export default function MindMap({ mindmap }) {
  if (!mindmap) return <p style={{ color: 'var(--text-3)' }}>No mind map available.</p>;

  const layout = useMemo(() => {
    const tree = buildLayout(mindmap);
    const items = calcPositions(tree, 40, 40);
    const nodes = items.filter(i => !i.type);
    const edges = items.filter(i => i.type === 'edge');
    const maxX = Math.max(...nodes.map(n => n.x)) + NODE_W + 40;
    const maxY = Math.max(...nodes.map(n => n.y)) + NODE_H / 2 + 40;
    return { nodes, edges, width: maxX, height: maxY };
  }, [mindmap]);

  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)' }}>
          Visual Mind Map
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Scroll horizontally if needed</span>
      </div>

      <div className="mindmap-wrapper">
        <svg
          className="mindmap-svg"
          width={layout.width}
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          style={{ overflow: 'visible' }}
        >
          {/* Edges */}
          {layout.edges.map((e, i) => (
            <path
              key={i}
              d={`M${e.x1},${e.y1} C${e.x1 + H_GAP * 0.6},${e.y1} ${e.x2 - H_GAP * 0.6},${e.y2} ${e.x2},${e.y2}`}
              fill="none"
              stroke={e.color}
              strokeWidth={1.5}
              strokeOpacity={0.5}
            />
          ))}

          {/* Nodes */}
          {layout.nodes.map((n, i) => {
            const x = n.x;
            const y = n.y - NODE_H / 2;
            const isRoot = i === 0;
            return (
              <g key={i}>
                <rect
                  x={x} y={y}
                  width={NODE_W} height={NODE_H}
                  rx={isRoot ? 10 : 8}
                  fill={isRoot ? n.color : 'var(--surface-2)'}
                  stroke={n.color}
                  strokeWidth={isRoot ? 0 : 1.5}
                  opacity={isRoot ? 1 : 0.9}
                />
                <text
                  x={x + NODE_W / 2}
                  y={y + NODE_H / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isRoot ? '#080a0f' : n.color}
                  fontSize={isRoot ? 13 : 11.5}
                  fontWeight={isRoot ? 700 : 500}
                  fontFamily="'Syne', sans-serif"
                  style={{ userSelect: 'none' }}
                >
                  {n.label.length > 18 ? n.label.slice(0, 17) + '…' : n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
