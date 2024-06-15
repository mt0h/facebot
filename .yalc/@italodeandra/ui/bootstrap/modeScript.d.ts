declare const modeScript = "\n  let darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')\n\n  updateMode()\n  darkModeMediaQuery.addEventListener('change', updateModeWithoutTransitions)\n  window.addEventListener('storage', updateModeWithoutTransitions)\n\n  function updateMode() {\n    let isSystemDarkMode = darkModeMediaQuery.matches\n    let isDarkMode = window.localStorage.isDarkMode === 'true' || (!('isDarkMode' in window.localStorage) && isSystemDarkMode)\n\n    if (isDarkMode) {\n      document.documentElement.classList.add('dark')\n    } else {\n      document.documentElement.classList.remove('dark')\n    }\n\n    if (isDarkMode === isSystemDarkMode) {\n      delete window.localStorage.isDarkMode\n    }\n  }\n\n  function disableTransitionsTemporarily() {\n    document.documentElement.classList.add('[&_*]:!transition-none')\n    window.setTimeout(() => {\n      document.documentElement.classList.remove('[&_*]:!transition-none')\n    }, 0)\n  }\n\n  function updateModeWithoutTransitions() {\n    disableTransitionsTemporarily()\n    updateMode()\n  }\n";
export default modeScript;