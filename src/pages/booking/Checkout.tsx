import { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import { navigate } from '../../lib/router';
import { type MockFlight, formatDuration } from '../../data/mockFlights';
import { type MockHotel } from '../../data/mockHotels';
import { AlertTriangle, Tag, ChevronRight, Loader2 } from 'lucide-react';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1">{label}</label>
      {children}
      {error && <p className="font-sans text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const inputCls = (err?: string) =>
  `w-full bg-bg border rounded-xl px-4 py-3 font-sans text-sm text-text-main outline-none transition-colors ${err ? 'border-red-400' : 'border-border focus:border-accent'}`;

function FlightSummary({ flight, passengers }: { flight: MockFlight; passengers: number }) {
  const taxes = Math.round(flight.price * 0.18);
  const total = (flight.price + taxes) * passengers;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-mono font-bold text-xs"
          style={{ backgroundColor: flight.airlineColor }}>
          {flight.airlineCode}
        </div>
        <div>
          <p className="font-sans text-sm font-semibold text-primary">{flight.departureAirport.iata} → {flight.arrivalAirport.iata}</p>
          <p className="font-mono text-xs text-muted">{flight.flightNumber} · {flight.cabin} · {formatDuration(flight.durationMinutes)}</p>
        </div>
      </div>
      <div className="flex justify-between font-sans text-sm"><span className="text-muted">Base fare × {passengers}</span><span>${(flight.price * passengers).toLocaleString()}</span></div>
      <div className="flex justify-between font-sans text-sm"><span className="text-muted">Taxes & fees</span><span>${(taxes * passengers).toLocaleString()}</span></div>
      <div className="h-px bg-border" />
      <div className="flex justify-between"><span className="font-display font-semibold text-primary text-sm">Total</span><span className="font-display font-bold text-primary text-lg">${total.toLocaleString()}</span></div>
    </div>
  );
}

function HotelSummary({ hotel, nights, rooms }: { hotel: MockHotel; nights: number; rooms: number }) {
  const subtotal = hotel.pricePerNight * nights * rooms;
  const taxes = Math.round(subtotal * 0.10);
  const total = subtotal + taxes;
  return (
    <div className="space-y-2">
      <div className="mb-3">
        <p className="font-sans text-sm font-semibold text-primary">{hotel.name}</p>
        <p className="font-sans text-xs text-muted">{hotel.roomType} · {nights} night{nights !== 1 ? 's' : ''}{rooms > 1 ? ` · ${rooms} rooms` : ''}</p>
      </div>
      <div className="flex justify-between font-sans text-sm"><span className="text-muted">${hotel.pricePerNight}/night × {nights}N{rooms > 1 ? ` × ${rooms}` : ''}</span><span>${subtotal.toLocaleString()}</span></div>
      <div className="flex justify-between font-sans text-sm"><span className="text-muted">Taxes (10%)</span><span>${taxes.toLocaleString()}</span></div>
      <div className="h-px bg-border" />
      <div className="flex justify-between"><span className="font-display font-semibold text-primary text-sm">Total</span><span className="font-display font-bold text-primary text-lg">${total.toLocaleString()}</span></div>
    </div>
  );
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  nationality: string;
  passport: string;
  requests: string;
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
  promo: string;
}

export default function Checkout() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type') as 'flight' | 'hotel' | null;

  const [flight, setFlight] = useState<MockFlight | null>(null);
  const [hotel, setHotel] = useState<MockHotel | null>(null);
  const [nights, setNights] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [passengers, setPassengers] = useState(1);
  const [promoApplied, setPromoApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [form, setForm] = useState<FormState>({
    firstName: '', lastName: '', email: '', phone: '',
    dob: '', nationality: '', passport: '',
    requests: '',
    cardNumber: '', cardName: '', expiry: '', cvv: '',
    promo: '',
  });

  useEffect(() => {
    if (type === 'flight') {
      const raw = sessionStorage.getItem('wander_selected_flight');
      if (raw) setFlight(JSON.parse(raw));
      const sRaw = sessionStorage.getItem('wander_flight_search');
      if (sRaw) {
        const p = JSON.parse(sRaw);
        setPassengers((p.passengers?.adults ?? 1) + (p.passengers?.children ?? 0) + (p.passengers?.infants ?? 0));
      }
    } else if (type === 'hotel') {
      const raw = sessionStorage.getItem('wander_selected_hotel');
      if (raw) setHotel(JSON.parse(raw));
      const sRaw = sessionStorage.getItem('wander_hotel_search');
      if (sRaw) {
        const p = JSON.parse(sRaw);
        setRooms(p.rooms ?? 1);
        if (p.checkIn && p.checkOut) {
          setNights(Math.max(1, Math.round((new Date(p.checkOut).getTime() - new Date(p.checkIn).getTime()) / 86400000)));
        }
      }
    }
  }, [type]);

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  function applyPromo() {
    if (form.promo.toUpperCase() === 'WANDER10') setPromoApplied(true);
  }

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Valid email required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.cardNumber.trim() || form.cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Enter a valid card number';
    if (!form.cardName.trim()) e.cardName = 'Required';
    if (!form.expiry.trim()) e.expiry = 'Required';
    if (!form.cvv.trim() || form.cvv.length < 3) e.cvv = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      navigate('/booking/confirmation');
    }, 1500);
  }

  function formatCard(val: string) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  }
  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  }

  return (
    <div className="min-h-screen bg-bg">
      <NavBar />
      <div className="pt-20 pb-16 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mt-6 mb-6">
          <h1 className="font-display font-bold text-primary text-2xl">Checkout</h1>
          <p className="font-sans text-sm text-muted mt-1">Complete your booking details below.</p>
        </div>

        {/* Test mode banner */}
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
          <AlertTriangle size={16} className="text-amber-600 shrink-0" />
          <p className="font-sans text-sm text-amber-700">
            <span className="font-semibold">Test mode</span> — No real payment will be processed. Use any card details.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: forms */}
            <div className="lg:col-span-2 space-y-5">

              {/* Contact Details */}
              <section className="bg-surface border border-border rounded-card p-5 shadow-card">
                <h2 className="font-display font-semibold text-primary text-base mb-4">Contact Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First Name" error={errors.firstName}>
                    <input className={inputCls(errors.firstName)} value={form.firstName}
                      onChange={e => set('firstName', e.target.value)} placeholder="John" />
                  </Field>
                  <Field label="Last Name" error={errors.lastName}>
                    <input className={inputCls(errors.lastName)} value={form.lastName}
                      onChange={e => set('lastName', e.target.value)} placeholder="Smith" />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <input type="email" className={inputCls(errors.email)} value={form.email}
                      onChange={e => set('email', e.target.value)} placeholder="john@example.com" />
                  </Field>
                  <Field label="Phone" error={errors.phone}>
                    <input type="tel" className={inputCls(errors.phone)} value={form.phone}
                      onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
                  </Field>
                </div>
              </section>

              {/* Traveller Details */}
              <section className="bg-surface border border-border rounded-card p-5 shadow-card">
                <h2 className="font-display font-semibold text-primary text-base mb-4">Traveller Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Date of Birth">
                    <input type="date" className={inputCls()} value={form.dob}
                      onChange={e => set('dob', e.target.value)} />
                  </Field>
                  <Field label="Nationality">
                    <input className={inputCls()} value={form.nationality}
                      onChange={e => set('nationality', e.target.value)} placeholder="British" />
                  </Field>
                  <Field label="Passport / ID No.">
                    <input className={inputCls()} value={form.passport}
                      onChange={e => set('passport', e.target.value)} placeholder="AB123456" />
                  </Field>
                </div>
              </section>

              {/* Special Requests */}
              <section className="bg-surface border border-border rounded-card p-5 shadow-card">
                <h2 className="font-display font-semibold text-primary text-base mb-4">Special Requests</h2>
                <Field label="Any requests? (optional)">
                  <textarea className={`${inputCls()} resize-none`} rows={3} value={form.requests}
                    onChange={e => set('requests', e.target.value)}
                    placeholder="e.g. wheelchair access, dietary requirements, early check-in..." />
                </Field>
              </section>

              {/* Payment */}
              <section className="bg-surface border border-border rounded-card p-5 shadow-card">
                <h2 className="font-display font-semibold text-primary text-base mb-4">Payment Details</h2>
                <div className="space-y-4">
                  <Field label="Card Number" error={errors.cardNumber}>
                    <input className={inputCls(errors.cardNumber)} value={form.cardNumber}
                      onChange={e => set('cardNumber', formatCard(e.target.value))}
                      placeholder="1234 5678 9012 3456" maxLength={19} />
                  </Field>
                  <Field label="Name on Card" error={errors.cardName}>
                    <input className={inputCls(errors.cardName)} value={form.cardName}
                      onChange={e => set('cardName', e.target.value)} placeholder="JOHN SMITH" />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Expiry" error={errors.expiry}>
                      <input className={inputCls(errors.expiry)} value={form.expiry}
                        onChange={e => set('expiry', formatExpiry(e.target.value))}
                        placeholder="MM/YY" maxLength={5} />
                    </Field>
                    <Field label="CVV" error={errors.cvv}>
                      <input className={inputCls(errors.cvv)} value={form.cvv}
                        onChange={e => set('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123" maxLength={4} type="password" />
                    </Field>
                  </div>
                </div>
              </section>

              {/* Promo code */}
              <section className="bg-surface border border-border rounded-card p-5 shadow-card">
                <h2 className="font-display font-semibold text-primary text-base mb-4">Promo Code</h2>
                {promoApplied ? (
                  <div className="flex items-center gap-2 bg-accent-2/10 border border-accent-2/30 rounded-xl px-4 py-3">
                    <Tag size={15} className="text-accent-2" />
                    <p className="font-sans text-sm text-accent-2 font-semibold">WANDER10 applied — 10% off</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input className="flex-1 bg-bg border border-border rounded-xl px-4 py-3 font-sans text-sm text-text-main outline-none focus:border-accent transition-colors"
                      value={form.promo} onChange={e => set('promo', e.target.value.toUpperCase())}
                      placeholder="Enter promo code" />
                    <button type="button" onClick={applyPromo}
                      className="px-4 py-3 bg-primary text-white font-sans text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors whitespace-nowrap">
                      Apply
                    </button>
                  </div>
                )}
              </section>
            </div>

            {/* Right: Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-surface border border-border rounded-card p-5 shadow-card sticky top-24 space-y-4">
                <h3 className="font-display font-semibold text-primary text-sm">Order Summary</h3>

                {type === 'flight' && flight && (
                  <FlightSummary flight={flight} passengers={passengers} />
                )}
                {type === 'hotel' && hotel && (
                  <HotelSummary hotel={hotel} nights={nights} rooms={rooms} />
                )}

                {promoApplied && (
                  <div className="flex items-center gap-2 bg-accent-2/10 border border-accent-2/30 rounded-lg px-3 py-2">
                    <Tag size={12} className="text-accent-2" />
                    <p className="font-sans text-xs text-accent-2 font-semibold">WANDER10 — 10% off applied</p>
                  </div>
                )}

                <button type="submit" disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-sans font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Processing...</>
                  ) : (
                    <>Confirm Booking <ChevronRight size={16} /></>
                  )}
                </button>

                <p className="font-sans text-xs text-muted text-center">
                  Secured checkout. No real charges will be made.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
