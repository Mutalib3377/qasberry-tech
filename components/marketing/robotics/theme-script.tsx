// components/marketing/robotics/theme-script.tsx
// Server-rendered inline script that sets <html data-rx-theme> before the
// first paint, so the homepage never flashes the wrong theme. Saved choice
// wins; otherwise it follows the OS setting. Client-side navigations don't
// run inline scripts — RxThemeInit (theme.tsx) covers that case.

export const RX_THEME_KEY = 'qasberry-theme'

const SCRIPT = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('${RX_THEME_KEY}');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}d.setAttribute('data-rx-theme',t)}catch(e){d.setAttribute('data-rx-theme','dark')}})();`

export function RxThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
}
