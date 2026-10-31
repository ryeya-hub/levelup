// Resolve appearance without changing or persisting the profile's preference.
export const themePreference = theme => ['dark', 'light', 'system'].includes(theme) ? theme : 'light'
export const resolveTheme = theme => themePreference(theme) === 'system'
  ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  : themePreference(theme)
