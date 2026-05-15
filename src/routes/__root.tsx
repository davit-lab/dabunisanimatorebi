import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Nav, Footer, Blobs } from "@/components/site/Layout";
import { ThemeApplier } from "@/components/site/ThemeApplier";

/** True when Vite mounts the app into index.html #root (SPA), not full-document SSR. */
function isSpaClient() {
  return typeof document !== "undefined" && document.getElementById("root") != null;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-bold">Page not found</h2>
        <Link to="/" className="mt-6 inline-flex px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-sm">
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try refreshing or head home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dubuni — Joyful Kids Events" },
      { name: "description", content: "Premium animators, programs and services for unforgettable children's events." },
      { property: "og:title", content: "Dubuni — Joyful Kids Events" },
      { property: "og:description", content: "Premium animators, programs and services for unforgettable children's events." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Dubuni — Joyful Kids Events" },
      { name: "twitter:description", content: "Premium animators, programs and services for unforgettable children's events." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e0a318c6-b158-44ce-b866-6dcf8d8b60cf/id-preview-d2ea95d4--8631722c-5c39-4bf4-9af3-9e6e8a92cbfe.lovable.app-1778853485731.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e0a318c6-b158-44ce-b866-6dcf8d8b60cf/id-preview-d2ea95d4--8631722c-5c39-4bf4-9af3-9e6e8a92cbfe.lovable.app-1778853485731.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  // SPA: #root already lives inside index.html <body> — never nest another <html>.
  if (isSpaClient()) {
    return (
      <>
        <HeadContent />
        {children}
      </>
    );
  }

  return (
    <html lang="ka">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <SiteFrame />
    </QueryClientProvider>
  );
}

function SiteFrame() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isAuth = location.pathname === "/auth";
  if (isAdmin || isAuth) {
    return (
      <>
        <ThemeApplier />
        <Outlet />
      </>
    );
  }
  return (
    <div className="min-h-screen flex flex-col relative">
      <ThemeApplier />
      <Blobs />
      <Nav />
      <main className="pt-20 md:pt-24 flex-grow relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
