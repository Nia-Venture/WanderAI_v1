import NavBar from '../../components/NavBar';
import FlightSearchForm from '../../components/booking/FlightSearchForm';
import { Plane } from 'lucide-react';

export default function FlightSearch() {
  return (
    <div className="min-h-screen bg-bg">
      <NavBar />
      <div className="pt-20 pb-16 max-w-2xl mx-auto px-4 sm:px-6">
        <div className="mt-10 mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent/10 mb-4">
            <Plane size={22} className="text-accent" />
          </div>
          <h1 className="font-display font-bold text-primary text-3xl">Search Flights</h1>
          <p className="font-sans text-muted text-sm mt-2">
            Compare fares across airlines — mock data, real-feel experience.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-card p-6 shadow-card">
          <FlightSearchForm />
        </div>
      </div>
    </div>
  );
}
