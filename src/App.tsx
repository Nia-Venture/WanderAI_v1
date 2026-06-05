import { useRouter } from './lib/router';
import { AuthProvider } from './lib/auth';
import Landing from './pages/Landing';
import City from './pages/City';
import BecomeALocal from './pages/BecomeALocal';
import Auth from './pages/Auth';
import LocalPending from './pages/LocalPending';

function Routes() {
  const { match } = useRouter();

  const cityMatch = match('/city/:cityName');
  if (cityMatch) return <City cityName={cityMatch.params.cityName} />;

  if (match('/become-a-local')) return <BecomeALocal />;
  if (match('/auth')) return <Auth />;
  if (match('/local-pending')) return <LocalPending />;

  return <Landing />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}
