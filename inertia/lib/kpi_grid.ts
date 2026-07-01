export function kpiGridClass(count: number) {
  const columns = Math.ceil(count / 2)

  if (columns <= 2) {
    return 'sm:grid-cols-2'
  }
  if (columns === 3) {
    return 'sm:grid-cols-2 lg:grid-cols-3'
  }
  if (columns === 4) {
    return 'grid-cols-2 md:grid-cols-4'
  }

  return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
}
