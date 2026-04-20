import React from 'react';
import { MapPin, Navigation, Info, Activity } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { VENUE_CONFIG } from '../config/constants';
import './VenueMap.css';

const VenueMap = ({ location = VENUE_CONFIG.NAME }) => {
  const [viewType, setViewType] = React.useState('floorplan');
  const [activeHotspot, setActiveHotspot] = React.useState(null);

  // Standard Google Maps Embed URL generator
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY || 'MOCK_KEY'}&q=${encodeURIComponent(location)}`;

  return (
    <div className="venue-map-container card border-glass">
      <div className="map-header">
        <div className="flex items-center gap-2">
          <div className="pulsing-indicator"></div>
          <h3 className="section-title">Live Venue Radar</h3>
        </div>
        <div className="flex gap-2">
          <button 
            className={`map-view-toggle ${viewType === 'floorplan' ? 'active' : ''}`}
            onClick={() => setViewType('floorplan')}
          >
            Floor Plan
          </button>
          <button 
            className={`map-view-toggle ${viewType === 'googlemap' ? 'active' : ''}`}
            onClick={() => setViewType('googlemap')}
          >
            Google Maps
          </button>
        </div>
      </div>

      <div className="map-wrapper mt-4">
        {viewType === 'floorplan' ? (
          <div className="floor-plan-svg-container animate-fade-in relative">
            <svg viewBox="0 0 800 500" className="floor-plan-svg" aria-label="Venue Floor Plan">
              {/* Outer Walls */}
              <rect x="50" y="50" width="700" height="400" rx="20" className="svg-bg" />
              
              {/* Rooms from Config */}
              {Object.entries(VENUE_CONFIG.ROOMS).map(([name, pos]) => (
                <g key={name}>
                  <rect 
                    x={pos.x - 70} 
                    y={pos.y - 40} 
                    width="140" 
                    height="80" 
                    rx="8" 
                    className={`svg-room ${name === 'Innovation Hub' ? 'active' : ''}`} 
                  />
                  <text x={pos.x} y={pos.y} className="svg-label" textAnchor="middle">{name}</text>
                </g>
              ))}

              {/* Pathfinding Connection (Intelligent Routing) */}
              <Motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                d="M 390 140 Q 390 240 230 345" 
                className="svg-path-ai" 
              />
              
              {/* User Indicator */}
              <circle cx="390" cy="140" r="6" className="svg-user-dot" />
              <circle cx="390" cy="140" r="14" className="svg-user-ring animate-ping-slow" />
              
              {/* Match Hotspots from Config */}
              {VENUE_CONFIG.HOTSPOTS.map(spot => (
                <g 
                  key={spot.id} 
                  className="hotspot-group cursor-pointer"
                  onClick={() => setActiveHotspot(spot)}
                >
                  <circle cx={spot.x} cy={spot.y} r="12" fill={spot.color} opacity="0.2" className="animate-pulse" />
                  <circle cx={spot.x} cy={spot.y} r="4" fill={spot.color} />
                  <text x={spot.x + 8} y={spot.y + 4} className="hotspot-label">{spot.count} Matches</text>
                </g>
              ))}

              {/* Next Milestone */}
              <g transform="translate(230, 345)">
                <circle r="6" className="svg-dest-dot" />
                <text y="-15" x="-40" className="svg-dest-label">EST: 2m Walk</text>
              </g>
            </svg>

            {activeHotspot && (
              <Motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="hotspot-tooltip card border-glass"
                style={{ left: activeHotspot.x, top: activeHotspot.y - 80 }}
              >
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-accent-primary" />
                  <span className="text-xs font-bold">{activeHotspot.name}</span>
                </div>
                <p className="text-[10px] text-secondary mt-1">{activeHotspot.count} people with matching interests are currently here.</p>
                <button className="hotspot-close" onClick={() => setActiveHotspot(null)}>×</button>
              </Motion.div>
            )}
          </div>
        ) : (
          <div className="google-map-embed-container animate-fade-in">
            <iframe
              title="Google Maps Venue View"
              width="100%"
              height="320"
              style={{ border: 0, borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={mapUrl}
            ></iframe>
          </div>
        )}
        
        <div className="map-legend">
          <div className="legend-item"><div className="dot dot-user"></div> <span>Current Position</span></div>
          <div className="legend-item"><div className="dot dot-ai"></div> <span>AI Pathfinding</span></div>
          <div className="legend-item"><div className="dot dot-hotspot"></div> <span>Networking Hotspots</span></div>
        </div>
      </div>

      <div className="venue-details mt-4 flex justify-between items-end">
        <div>
          <p className="text-sm font-semibold">{location}</p>
          <p className="text-xs text-secondary mt-1">Main Hall · Innovation District, Level 2</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-tertiary">Real-time Pulse</p>
          <p className="text-xs font-medium text-accent-secondary">High Density (84%)</p>
        </div>
      </div>
    </div>
  );
};

export default VenueMap;
