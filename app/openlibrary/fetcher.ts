export function fetcher(url: string) {
  return fetch(url, {
    headers: {
      "User-Agent": "Overleaf Club (https://overleaf.club) - hey@danreev.es",
      Accept: "application/json",
    },
    cf: { cacheTtlByStatus: { "200-299": 86400, 404: 1, "500-599": 0 } },
  })
}
