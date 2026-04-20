/**
 * ICS Calendar Generation Utility
 */

export const generateICS = (sessions, userInterests = []) => {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MeetFlow AI//Event Concierge//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  sessions.forEach((session, index) => {
    // Simple date parsing for demo. In real app, use a lib like date-fns
    // Assuming format "09:00 AM - 10:00 AM" and today's date
    const [startPart] = session.time.split(' - ');
    const startDate = new Date();
    const [h, m] = startPart.split(' ')[0].split(':');
    const isPM = startPart.includes('PM');
    startDate.setHours(isPM ? parseInt(h) + 12 : parseInt(h), parseInt(m), 0, 0);
    
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1hr duration

    const startISO = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endISO = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const reasoning = session.reason || `Personalized pick based on your interests in ${userInterests.slice(0, 2).join(', ')}.`;

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:meetflow-${session.id}-${index}`);
    icsContent.push(`DTSTAMP:${now}`);
    icsContent.push(`DTSTART:${startISO}`);
    icsContent.push(`DTEND:${endISO}`);
    icsContent.push(`SUMMARY:MeetFlow: ${session.title}`);
    icsContent.push(`LOCATION:${session.location}`);
    icsContent.push(`DESCRIPTION:AI INSIGHT: ${reasoning}\\n\\nExported via MeetFlow AI Concierge.`);
    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');

  return icsContent.join('\r\n');
};

export const downloadICS = (content, filename = 'meetflow-agenda.ics') => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
