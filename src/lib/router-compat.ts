import { useCallback } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate as useReactRouterNavigate,
  type NavigateFunction,
} from "react-router-dom";

export { Link, NavLink, Outlet };

export type RouterLocation = {
  pathname: string;
  search: string;
  searchStr: string;
  hash: string;
  href: string;
};

export type RouterState = {
  location: RouterLocation;
};

type NavigateParams = Record<string, string | number | undefined>;

type NavigateOptions = {
  to: string;
  params?: NavigateParams;
  search?: Record<string, unknown> | string;
  replace?: boolean;
  hash?: string;
};

function interpolateParams(to: string, params?: NavigateParams): string {
  if (!params) return to;
  return to.replace(/\$([A-Za-z0-9_]+)/g, (_match, key: string) => {
    const value = params[key];
    return encodeURIComponent(value == null ? "" : String(value));
  });
}

function buildSearch(search: NavigateOptions["search"]): string {
  if (!search) return "";
  if (typeof search === "string") return search.startsWith("?") ? search : `?${search}`;
  const params = new URLSearchParams();
  Object.entries(search).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function useNavigate(): (options: NavigateOptions | string) => void {
  const navigate: NavigateFunction = useReactRouterNavigate();
  return useCallback(
    (options: NavigateOptions | string) => {
      if (typeof options === "string") {
        void navigate(options);
        return;
      }
      const to =
        interpolateParams(options.to, options.params) +
        buildSearch(options.search) +
        (options.hash ?? "");
      void navigate(
        to,
        options.replace === undefined ? undefined : { replace: options.replace },
      );
    },
    [navigate],
  );
}

export function useRouterState<T>(options: { select: (state: RouterState) => T }): T;
export function useRouterState(): RouterState;
export function useRouterState<T>(
  options?: { select?: (state: RouterState) => T },
): T | RouterState {
  const location = useLocation();
  const state: RouterState = {
    location: {
      pathname: location.pathname,
      search: location.search,
      searchStr: location.search,
      hash: location.hash,
      href: `${location.pathname}${location.search}${location.hash}`,
    },
  };
  return options?.select ? options.select(state) : state;
}
