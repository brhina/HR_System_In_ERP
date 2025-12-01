export function toDate(value) {
  return value instanceof Date ? value : new Date(value);
}

export function startOfDay(value) {
  const d = toDate(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(value) {
  const d = toDate(value);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function dateRange(from, to) {
  // Handle empty strings as undefined
  const fromDate = from && from !== '' ? toDate(from) : undefined;
  const endDate = to && to !== '' ? toDate(to) : undefined;
  return { 
    ...(fromDate ? { gte: fromDate } : {}), 
    ...(endDate ? { lte: endDate } : {}) 
  };
}


