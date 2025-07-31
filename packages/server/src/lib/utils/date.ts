import moment from "moment";

// Format date for display
export function formatDate(date: string | Date, format = "MMM D, YYYY"): string {
  return moment(date).format(format);
}

// Format date with time
export function formatDateTime(date: string | Date, format = "MMM D, YYYY [at] h:mm A"): string {
  return moment(date).format(format);
}

// Get relative time (e.g., "2 hours ago", "in 3 days")
export function getRelativeTime(date: string | Date): string {
  const momentDate = typeof date === 'string' ? moment.utc(date) : moment(date);
  return momentDate.fromNow();
}

// Check if date is overdue
export function isOverdue(date: string | Date): boolean {
  return moment(date).isBefore(moment());
}

// Check if date is today
export function isToday(date: string | Date): boolean {
  return moment(date).isSame(moment(), 'day');
}

// Check if date is tomorrow
export function isTomorrow(date: string | Date): boolean {
  return moment(date).isSame(moment().add(1, 'day'), 'day');
}

// Get smart date display (Today, Tomorrow, or formatted date)
export function getSmartDateDisplay(date: string | Date): string {
  const momentDate = moment(date);
  const now = moment();
  
  if (momentDate.isSame(now, 'day')) {
    return `Today at ${momentDate.format('h:mm A')}`;
  }
  
  if (momentDate.isSame(now.clone().add(1, 'day'), 'day')) {
    return `Tomorrow at ${momentDate.format('h:mm A')}`;
  }
  
  if (Math.abs(momentDate.diff(now, 'days')) <= 7) {
    return momentDate.format('dddd [at] h:mm A');
  }
  
  return momentDate.format('MMM D, YYYY [at] h:mm A');
}

// Create date at end of day (23:59:59)
export function createEndOfDay(date?: string | Date): Date {
  return moment(date).endOf('day').toDate();
}

// Create date at start of day (00:00:00)
export function createStartOfDay(date?: string | Date): Date {
  return moment(date).startOf('day').toDate();
} 

// Get specific relative time (e.g., "5 minutes ago", "2 hours ago", "3 days ago")
export function getSpecificRelativeTime(date: string | Date): string {
  const momentDate = typeof date === 'string' ? moment.utc(date) : moment(date);
  const now = moment();
  const diffInMinutes = Math.abs(momentDate.diff(now, 'minutes'));
  const diffInHours = Math.abs(momentDate.diff(now, 'hours'));
  const diffInDays = Math.abs(momentDate.diff(now, 'days'));
  
  if (diffInMinutes < 1) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  } else {
    // For longer periods, show the actual date
    return momentDate.format('MMM D, YYYY [at] h:mm A');
  }
} 