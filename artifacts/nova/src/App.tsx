import { useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, Redirect, useLocation } from 'wouter';
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { dark } from '@clerk/themes';

// Layouts
import StorefrontLayout from '@/layouts/storefront-layout';
import LabLayout from '@/layouts/lab-layout';
import PartnerLayout from '@/layouts/partner-layout';

// Storefront Pages
import StorefrontHome from '@/pages/storefront/home';
import ProjectsIndex from '@/pages/storefront/projects';
import ProjectDetails from '@/pages/storefront/project-details';
import HireMe from '@/pages/storefront/hire';
import CustomBuild from '@/pages/storefront/custom';

// Lab Pages
import LabHome from '@/pages/lab/home';
import LabSystems from '@/pages/lab/systems';
import LabSystemDetails from '@/pages/lab/system-details';
import LabBriefing from '@/pages/lab/briefing';

// Partner Pages
import PartnerHome from '@/pages/partner/home';
import PartnerDecisions from '@/pages/partner/decisions';

const queryClient = new QueryClient();

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

// REQUIRED — copy verbatim per Clerk setup instructions
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

// REQUIRED — empty in dev (intentional), auto-set in prod
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

const clerkAppearance = {
  baseTheme: dark,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#FF80AB',
    colorForeground: '#FFFFFF',
    colorMutedForeground: '#888888',
    colorDanger: '#FF6B6B',
    colorBackground: '#0a0a0a',
    colorInput: '#151515',
    colorInputForeground: '#FFFFFF',
    colorNeutral: '#2a2a2a',
    fontFamily: "'Space Mono', monospace",
    borderRadius: '2px',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'border border-[#222] w-[440px] max-w-full overflow-hidden',
    card: '!shadow-none !border-0 !bg-[#0a0a0a] !rounded-none',
    footer: '!shadow-none !border-0 !bg-[#0a0a0a] !rounded-none',
    headerTitle: 'text-white',
    headerSubtitle: 'text-[#888]',
    socialButtonsBlockButtonText: 'text-white',
    formFieldLabel: 'text-[#aaa] text-xs uppercase tracking-widest',
    footerActionLink: 'text-[#FF80AB] hover:text-[#ffaac8]',
    footerActionText: 'text-[#555]',
    dividerText: 'text-[#555]',
    identityPreviewEditButton: 'text-[#FF80AB]',
    formFieldSuccessText: 'text-green-400',
    alertText: 'text-[#FF6B6B]',
    logoBox: 'mb-2',
    logoImage: 'h-8',
    socialButtonsBlockButton: 'border border-[#2a2a2a] bg-[#111] hover:bg-[#1a1a1a] text-white',
    formButtonPrimary: 'bg-[#FF80AB] hover:bg-[#ffaac8] text-black font-bold tracking-widest uppercase text-xs',
    formFieldInput: 'bg-[#111] border-[#2a2a2a] text-white',
    footerAction: 'border-t border-[#1a1a1a]',
    dividerLine: 'bg-[#222]',
    alert: 'bg-[#1a1a1a] border border-[#2a2a2a]',
    otpCodeFieldInput: 'bg-[#111] border-[#2a2a2a] text-white',
    formFieldRow: '',
    main: '',
  },
};

// Invalidate React Query cache on user change
function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

// Protect partner routes — redirect to sign-in if not authenticated
function PartnerGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

// HOCs for Layouts
const withStorefront = (Component: React.ComponentType<any>) => (props: any) => (
  <StorefrontLayout>
    <Component {...props} />
  </StorefrontLayout>
);

const withLab = (Component: React.ComponentType<any>) => (props: any) => (
  <LabLayout>
    <Component {...props} />
  </LabLayout>
);

const withPartner = (Component: React.ComponentType<any>) => (props: any) => (
  <PartnerGuard>
    <PartnerLayout>
      <Component {...props} />
    </PartnerLayout>
  </PartnerGuard>
);

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0a0a0a] px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/partner`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0a0a0a] px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={`${basePath}/partner`}
      />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Storefront Routes */}
      <Route path="/" component={withStorefront(StorefrontHome)} />
      <Route path="/projects" component={withStorefront(ProjectsIndex)} />
      <Route path="/projects/:id" component={withStorefront(ProjectDetails)} />
      <Route path="/hire" component={withStorefront(HireMe)} />
      <Route path="/custom" component={withStorefront(CustomBuild)} />

      {/* Lab Routes */}
      <Route path="/lab" component={withLab(LabHome)} />
      <Route path="/lab/systems" component={withLab(LabSystems)} />
      <Route path="/lab/systems/:id" component={withLab(LabSystemDetails)} />
      <Route path="/lab/briefing" component={withLab(LabBriefing)} />

      {/* Partner Routes — guarded */}
      <Route path="/partner" component={withPartner(PartnerHome)} />
      <Route path="/partner/decisions" component={withPartner(PartnerDecisions)} />

      {/* Auth Routes */}
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />

      {/* Fallback */}
      <Route>
        <StorefrontLayout>
          <NotFound />
        </StorefrontLayout>
      </Route>
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: 'Partner Access',
            subtitle: 'AI&U Command Center',
          },
        },
        signUp: {
          start: {
            title: 'Create Access',
            subtitle: 'AI&U Command Center',
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
