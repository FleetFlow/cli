export function outputJson(command, value) {
  command.log(JSON.stringify(value ?? null, null, 2))
}

export function unwrapList(value) {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object') return Object.values(value)
  return []
}

export function printReadable(command, value) {
  if (value === undefined) {
    command.log('Done')
    return
  }
  const rows = unwrapList(value)
  if (rows.length > 0 && rows.every((row) => row && typeof row === 'object')) {
    const columns = preferredColumns(rows)
    const widths = columns.map((column) => Math.max(column.length, ...rows.map((row) => String(row[column] ?? '').length))).map((width) => Math.min(width, 42))
    command.log(columns.map((column, index) => column.padEnd(widths[index])).join('  '))
    command.log(widths.map((width) => '-'.repeat(width)).join('  '))
    for (const row of rows) {
      command.log(columns.map((column, index) => truncate(String(row[column] ?? ''), widths[index]).padEnd(widths[index])).join('  '))
    }
    return
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (typeof item !== 'object' || item === null) command.log(`${key}: ${item}`)
    }
    if (Object.values(value).every((item) => typeof item === 'object' && item !== null)) {
      command.log(JSON.stringify(value, null, 2))
    }
    return
  }
  command.log(String(value))
}

function preferredColumns(rows) {
  const keys = new Set(rows.flatMap((row) => Object.keys(row)))
  const preferred = ['uuid', 'name', 'email', 'status', 'type', 'vin', 'created_at', 'updated_at'].filter((key) => keys.has(key))
  const remaining = [...keys].filter((key) => !preferred.includes(key)).slice(0, Math.max(0, 5 - preferred.length))
  return [...preferred, ...remaining].slice(0, 6)
}

function truncate(value, width) {
  if (value.length <= width) return value
  return `${value.slice(0, Math.max(0, width - 1))}…`
}
