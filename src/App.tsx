import { useEffect } from 'react';
import { useRouter } from './lib/router';
import { AuthProvider } from './lib/auth';
import { supabase } from './lib/supabase';
import { navigate } from './lib/router';
import Landing from './pages/Landing';
import City from './pages/City';
import BecomeALocal from './pages/BecomeALocal';
import Auth from './pages/Auth';
import LocalPending from './pages/LocalPending';
import Dashboard from './pages/Dashboard';
import Welcome from './pages/Welcome';
import Settings from './pages/Settings';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import HotelSearch from './pages/booking/HotelSearch';
import HotelResults from './pages/booking/HotelResults';
import HotelBooking from './pages/booking/HotelBooking';
import Checkout from './pages/booking/Checkout';
import BookingConfirmation from './pages/booking/BookingConfirmation';

function Routes() {
  const { match } = useRouter();

  const cityMatch = match('/city/:cityName');
  if (cityMatch) return <City cityName={cityMatch.params.cityName} />;

  const hotelBookingMatch = match('/booking/hotel/:id');
  if (hotelBookingMatch) return <HotelBooking hotelId={decodeURIComponent(hotelBookingMatch.params.id)} />;

  if (match('/hotels/results')) return <HotelResults />;
  if (match('/hotels')) return <HotelSearch />;
  if (match('/booking/checkout')) return <Checkout />;
  if (match('/booking/confirmation')) return <BookingConfirmation />;

  if (match('/become-a-local')) return <BecomeALocal />;
  if (match('/auth')) return <Auth />;
  if (match('/local-pending')) return <LocalPending />;
  if (match('/dashboard')) return <Dashboard />;
  if (match('/welcome')) return <Welcome />;
  if (match('/settings')) return <Settings />;
  if (match('/privacy')) return <Privacy />;
  if (match('/terms')) return <Terms />;
  if (match('/')) return <Landing />;

  return <NotFound />;
}

export default function App() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/auth?mode=reset');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}
