import { useRouter } from './lib/router';
import { AuthProvider } from './lib/auth';
import Landing from './pages/Landing';
import City from './pages/City';
import BecomeALocal from './pages/BecomeALocal';
import Auth from './pages/Auth';
import LocalPending from './pages/LocalPending';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function Routes() {
  const { match } = useRouter();

  const cityMatch = match('/city/:cityName');
  if (cityMatch) return <City cityName={cityMatch.params.cityName} />;

  if (match('/become-a-local')) return <BecomeALocal />;
  if (match('/auth')) return <Auth />;
  if (match('/local-pending')) return <LocalPending />;
  if (match('/login')) return <Login />;
  if (match('/dashboard')) return <Dashboard />;

  return <Landing />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}
