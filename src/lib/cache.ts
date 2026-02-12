// src/lib/server/cache.ts
let cachedData: any = null;

async function fetchData() {
  // Fetch data from your API
  const response = await fetch("https://api.example.com/data");
  cachedData = await response.json();
}

// Initialize cache and set up periodic updates
fetchData(); // Initial fetch
setInterval(fetchData, 60000); // Update every 60 seconds

export function getCachedData() {
  return cachedData;
}
