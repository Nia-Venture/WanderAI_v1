import { useState, useEffect, useCallback } from 'react';

export type RouteParams = Record<string, string>;

interface MatchResult {
  params: RouteParams;
}

function matchRoute(pattern: string, pathname: string): RouteParams | null {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;
  const params: RouteParams = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

export function useRouter() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to: string) => {
    window.history.pushState(null, '', to);
    setPathname(to);
    window.scrollTo(0, 0);
  }, []);

  const match = useCallback(
    (pattern: string): MatchResult | null => {
      const params = matchRoute(pattern, pathname);
      if (params === null) return null;
      return { params };
    },
    [pathname]
  );

  return { pathname, navigate, match };
}

export function navigate(to: string) {
  window.history.pushState(null, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
}
