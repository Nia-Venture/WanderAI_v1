import NavBar from '../../components/NavBar';
import HotelSearchForm from '../../components/booking/HotelSearchForm';
import { navigate } from '../../lib/router';
import { Building2, ArrowLeft } from 'lucide-react';

export default function HotelSearch() {
  return (
    <div className="min-h-screen bg-bg">
      <NavBar />
      <div className="pt-20 pb-16 max-w-2xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 mt-6 font-sans text-sm text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft size={15} /> Back to search
        </button>

        <div className="mt-6 mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent/10 mb-4">
            <Building2 size={22} className="text-accent" />
          </div>
          <h1 className="font-display font-bold text-primary text-3xl">Search Hotels</h1>
          <p className="font-sans text-muted text-sm mt-2">
            Find and book hotels worldwide for your next trip.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-card p-6 shadow-card">
          <HotelSearchForm />
        </div>
      </div>
    </div>
  );
}
