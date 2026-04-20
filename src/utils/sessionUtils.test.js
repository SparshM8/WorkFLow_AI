import { describe, it, expect } from 'vitest';
import { parseSessionTime, detectConflicts } from './sessionUtils';

describe('Session Utility Logic', () => {
  it('parses session time strings into minutes', () => {
    const time = "09:00 AM - 10:30 AM";
    const result = parseSessionTime(time);
    expect(result.start).toBe(9 * 60); // 540
    expect(result.end).toBe(10 * 60 + 30); // 630
  });

  it('handles PM times correctly', () => {
    const time = "01:00 PM - 02:00 PM";
    const result = parseSessionTime(time);
    expect(result.start).toBe(13 * 60);
    expect(result.end).toBe(14 * 60);
  });

  it('detects simple conflicts/overlaps', () => {
    const s1 = { id: 1, time: "09:00 AM - 10:00 AM", title: "S1" };
    const s2 = { id: 2, time: "09:30 AM - 10:30 AM", title: "S2" };
    const conflicts = detectConflicts([s1, s2]);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].a.id).toBe(1);
    expect(conflicts[0].b.id).toBe(2);
  });

  it('identifies non-conflicting adjacent sessions', () => {
    const s1 = { id: 1, time: "09:00 AM - 10:00 AM", title: "S1" };
    const s2 = { id: 2, time: "10:00 AM - 11:00 AM", title: "S2" };
    const conflicts = detectConflicts([s1, s2]);
    expect(conflicts).toHaveLength(0); // Adjacent but not overlapping
  });

  it('handles invalid time strings gracefully', () => {
    const result = parseSessionTime("invalid");
    expect(result).toBeNull();
  });
});
