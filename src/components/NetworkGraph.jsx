import React, { useMemo } from 'react';
import { Sparkles, User, MessageCircle } from 'lucide-react';
import './NetworkGraph.css';

const NetworkGraph = ({ currentUser, matches, onSelectMatch }) => {
  const nodes = useMemo(() => {
    if (!currentUser || !matches) return [];
    
    const centerX = 300;
    const centerY = 300;
    const radius = 220;
    
    // Core (User) node
    const userNode = {
      id: 'me',
      x: centerX,
      y: centerY,
      name: 'You',
      role: currentUser.role,
      isMe: true
    };

    // Orbital nodes (Matches)
    const orbitalNodes = matches.slice(0, 10).map((m, i) => {
      const angle = (i / Math.min(matches.length, 10)) * 2 * Math.PI;
      // Distance based on match score (closer = higher score)
      const distPercent = (100 - (m.matchDetails?.score || 90)) / 100;
      const r = radius * (0.5 + distPercent * 0.4); 
      
      return {
        ...m,
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        angle
      };
    });

    return [userNode, ...orbitalNodes];
  }, [currentUser, matches]);

  return (
    <div className="network-graph-container glass-panel">
      <svg className="network-svg" viewBox="0 0 600 600">
        {/* Background Orbits */}
        <circle cx="300" cy="300" r="120" className="orbit-line" />
        <circle cx="300" cy="300" r="220" className="orbit-line-outer" />
        
        {/* Connection Lines to ME */}
        {nodes.filter(n => !n.isMe).map(n => (
          <line 
            key={`line-${n.id}`}
            x1="300" y1="300" 
            x2={n.x} y2={n.y} 
            className="graph-connection"
            strokeDasharray="4 4"
          />
        ))}

        {/* Nodes */}
        {nodes.map(node => (
          <g 
            key={node.id} 
            className={`graph-node ${node.isMe ? 'node-me' : 'node-match animate-pulse-slow'}`}
            onClick={() => !node.isMe && onSelectMatch(node)}
            style={{ '--angle': `${node.angle}rad` }}
          >
            <circle cx={node.x} cy={node.y} r={node.isMe ? 30 : 20} className="node-circle" />
            <foreignObject x={node.x - 40} y={node.y + (node.isMe ? 35 : 25)} width="80" height="40">
              <div className="node-label">
                <span className="name">{node.name}</span>
                {!node.isMe && <span className="score">{node.matchDetails?.score}%</span>}
              </div>
            </foreignObject>
            {/* Icon Overlay */}
            <g transform={`translate(${node.x - 10}, ${node.y - 10})`}>
              {node.isMe ? <User size={20} color="white" /> : <Sparkles size={20} color="var(--accent-secondary)" />}
            </g>
          </g>
        ))}
      </svg>
      
      <div className="graph-legend">
        <div className="legend-item">
          <div className="legend-dot dot-me"></div>
          <span>Your Core Goals</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot dot-match"></div>
          <span>AI Match Radius</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkGraph;
