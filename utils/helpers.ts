const primaryColors = ['red', 'green', 'yellow', 'blue', 'purple']
const primaryColorsHex = [
  '#D35400', // Dark Orange
  '#186A3B', // Dark Green
  '#4A148C', // Dark Purple
  '#FFA000', // Dark Amber
  '#1E7E34', // Dark Green
  '#0056B3', // Dark Blue
  '#0D7377', // Dark Cyan
  '#C82333', // Dark Red
  '#5806A0', // Dark Indigo
  '#D35400', // Dark Yellow
]

export function getColorByIndex(index: number) {
  const colorIndex = index % primaryColors.length
  return primaryColors[colorIndex]
}
export function getColorHexByIndex(index: number) {
  const colorIndex = index % primaryColorsHex.length
  return primaryColorsHex[colorIndex]
}
