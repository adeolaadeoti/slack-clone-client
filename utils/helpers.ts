import DOMPurify from 'dompurify'

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

export function formatDate(dateString: string): FormattedDate | undefined {
  if (dateString) {
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
}

export function truncateDraftToHtml(content: string) {
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [],
  })
  const maxLength = 28
  return sanitizedContent.length > maxLength
    ? sanitizedContent.slice(0, maxLength) + '...'
    : sanitizedContent
}

// Generate a random number between min and max
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Generate a random _id using timestamps and a 12-digit random number
export function generateRandomId(): string {
  const timestamp = Date.now() // Current timestamp in milliseconds
  const randomPart = getRandomNumber(100000000000, 999999999999) // Random 12-digit number

  return `${timestamp}${randomPart}`
}
