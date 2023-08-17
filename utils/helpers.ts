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

interface FormattedDate {
  time: string
  timeRender: string
}

export function formatDate(dateString: string): FormattedDate {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }

  const date = new Date(dateString)
  const formattedTime = new Intl.DateTimeFormat('en-US', options).format(date)
  const timeParts = formattedTime.split(', ')
  const timeRender = timeParts[1].replace(/:\d+\s/, ' ')

  return {
    time: formattedTime.replace(',', ' @ '),
    timeRender: timeRender,
  }
}
