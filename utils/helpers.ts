const primaryColors = ['red', 'yellow', 'green', 'blue', 'purple']
export function getColorByIndex(index: number) {
  const colorIndex = index % primaryColors.length
  return primaryColors[colorIndex]
}
