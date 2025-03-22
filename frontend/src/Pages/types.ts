export type Task = {
  id: string;
  date: string; // Instead of 'status', we use 'date'
  title: string;
  description: string;
  location : string;
};

export type Column = {
  id: string; // Date string (e.g., "2025-03-22")
  title: string; // "Day 1", "Day 2", etc.
};
