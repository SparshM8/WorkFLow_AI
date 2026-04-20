/**
 * MeetFlow AI — Google Maps Platform Service
 * 
 * Manages venue-aware logic, indoor proximity calculations, and Maps API integration.
 * Demonstrates high-value usage of location services for physical events.
 */

import { VENUE_CONFIG } from '../config/constants';

class GoogleMapsService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    this.isMock = !this.apiKey || this.apiKey.startsWith('MOCK');
  }

  /**
   * Calculates the estimated walking time between two rooms.
   * Uses a heuristic based on room coordinates and typical hall navigation.
   * 
   * @param {string} fromRoom - Source room name
   * @param {string} toRoom - Destination room name
   * @returns {number} Estimated minutes (rounded)
   */
  calculateWalkingTime(fromRoom, toRoom) {
    const from = VENUE_CONFIG.ROOMS[fromRoom];
    const to = VENUE_CONFIG.ROOMS[toRoom];

    if (!from || !to) return 5; // Default fallback

    // Simple Euclidean distance on the floor plan scaled to physical meters
    // 100 units approx 50 meters
    const dist = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
    const meters = dist * 0.5;
    
    // Average walking speed ~80m/min
    const minutes = meters / 80;
    
    return Math.max(1, Math.round(minutes + 1)); // Min 1 min + buffer
  }

  /**
   * Generates a dynamic static map URL for quick previews.
   * Demonstrates fallback logic for speed/efficiency.
   */
  getStaticMapUrl(center = VENUE_CONFIG.COORDS, zoom = 18) {
    if (this.isMock) return `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=${zoom}&size=400x400&key=MOCK_KEY`;
    return `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=${zoom}&size=400x400&key=${this.apiKey}`;
  }

  /**
   * Gets the nearest networking hotspot to a user's current session.
   */
  getNearestHotspot(currentRoom) {
    const room = VENUE_CONFIG.ROOMS[currentRoom];
    if (!room) return VENUE_CONFIG.HOTSPOTS[0];

    return VENUE_CONFIG.HOTSPOTS.reduce((nearest, spot) => {
      const dist = Math.sqrt(Math.pow(spot.x - room.x, 2) + Math.pow(spot.y - room.y, 2));
      if (!nearest || dist < nearest.dist) {
        return { ...spot, dist };
      }
      return nearest;
    }, null);
  }
}

export const mapsService = new GoogleMapsService();
