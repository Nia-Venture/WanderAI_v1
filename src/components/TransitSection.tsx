import { TrainFront, Bus, Car, Bike, Plane, Ship, Lightbulb } from 'lucide-react';

interface TransitMode {
  icon: React.ReactNode;
  name: string;
  tip: string;
  badge?: string;
  color: string;
  bgColor: string;
}

interface CityTransit {
  modes: TransitMode[];
  insiderTip: string;
}

const CITY_DATA: Record<string, CityTransit> = {
  london: {
    modes: [
      {
        icon: <TrainFront size={18} />,
        name: 'Underground & Elizabeth line',
        tip: 'Tap contactless or Oyster at every barrier — cash costs 3× more. The Elizabeth line cuts Heathrow to central London to 30 min.',
        badge: 'Most popular',
        color: 'text-red-500',
        bgColor: 'bg-red-50 border-red-100',
      },
      {
        icon: <Bus size={18} />,
        name: 'Night Bus',
        tip: '24-hour buses run all night on major routes — cheaper and often faster than a taxi after 11 pm. Contactless only, no cash accepted.',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-100',
      },
      {
        icon: <Car size={18} />,
        name: 'Uber / Bolt',
        tip: 'Both apps work well. Avoid unlicensed minicabs — a licensed Hackney black cab has a yellow badge and is always metered.',
        color: 'text-slate-600',
        bgColor: 'bg-slate-50 border-slate-100',
      },
      {
        icon: <Bike size={18} />,
        name: 'Santander Cycles',
        tip: '£2 for 24 h access, then free for every ride under 30 min. Docking stations every 300 m in Zone 1 — perfect for daytime errands.',
        badge: 'Best value',
        color: 'text-orange-500',
        bgColor: 'bg-orange-50 border-orange-100',
      },
      {
        icon: <Plane size={18} />,
        name: 'Airport Transfer',
        tip: 'Heathrow: Elizabeth line (30 min, ~£11). Heathrow Express (15 min, ~£25). Gatwick: Thameslink or Gatwick Express from Victoria (30 min).',
        color: 'text-sky-600',
        bgColor: 'bg-sky-50 border-sky-100',
      },
    ],
    insiderTip: 'Zone 1–2 contactless daily cap is £8.10 — just tap in and out everywhere and London\'s system automatically finds the cheapest fare for you.',
  },

  dubai: {
    modes: [
      {
        icon: <TrainFront size={18} />,
        name: 'Dubai Metro',
        tip: 'Red and Green lines cover the main tourist corridor (Marina → DIFC → Deira). Get a Nol card at any station — tap on/off everything.',
        badge: 'Best value',
        color: 'text-red-500',
        bgColor: 'bg-red-50 border-red-100',
      },
      {
        icon: <Car size={18} />,
        name: 'Careem / Uber',
        tip: 'Both are widely used and safe. Surge pricing hits 7–9 am and 4–7 pm on Sheikh Zayed Road — metro is faster during peak hours.',
        badge: 'Most popular',
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-100',
      },
      {
        icon: <Ship size={18} />,
        name: 'Water Taxi (Abra)',
        tip: 'The wooden Abra boats cross Dubai Creek for just 1 AED — the most scenic and authentic transit experience in the city.',
        color: 'text-teal-600',
        bgColor: 'bg-teal-50 border-teal-100',
      },
      {
        icon: <Bus size={18} />,
        name: 'Bus',
        tip: 'Air-conditioned buses run across the emirate. Nol card required — no cash accepted. Useful for areas the Metro doesn\'t reach.',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-100',
      },
      {
        icon: <Plane size={18} />,
        name: 'Airport Transfer',
        tip: 'Metro Red line runs directly to DXB Terminals 1 & 3 — 15–25 min to central Dubai for 26 AED. Cheapest and fastest option.',
        badge: 'Fastest',
        color: 'text-sky-600',
        bgColor: 'bg-sky-50 border-sky-100',
      },
    ],
    insiderTip: 'Taxis outside malls queue up fast but meter starts the moment you enter — not when you depart. Agree price upfront for long airport runs after midnight.',
  },

  tokyo: {
    modes: [
      {
        icon: <TrainFront size={18} />,
        name: 'JR & Tokyo Metro',
        tip: 'A Suica or Pasmo IC card works on every train, bus, and even vending machines. Load it at any station machine — no cash fumbling ever.',
        badge: 'Most popular',
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-100',
      },
      {
        icon: <TrainFront size={18} />,
        name: 'Yamanote Line',
        tip: 'The green loop line connects every major district (Shibuya → Shinjuku → Harajuku → Akihabara). Memorise it — it\'s your backbone.',
        badge: 'Best value',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 border-emerald-100',
      },
      {
        icon: <Car size={18} />,
        name: 'Taxi',
        tip: 'Metered, safe and immaculate — but expensive (¥730 flag fall + ¥90/280 m). Use only for late nights or heavy luggage. Door opens automatically.',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 border-yellow-100',
      },
      {
        icon: <Bike size={18} />,
        name: 'Cycling',
        tip: 'Many neighbourhoods have bike-share stations (Hello Cycling). Locals cycle everywhere — pavement cycling is widely accepted outside central areas.',
        color: 'text-orange-500',
        bgColor: 'bg-orange-50 border-orange-100',
      },
      {
        icon: <Plane size={18} />,
        name: 'Airport Transfer',
        tip: 'From Narita: Narita Express (55 min, ¥3,070) or Keisei Skyliner (41 min). From Haneda: Keikyu or Tokyo Monorail (30 min, ~¥600).',
        color: 'text-sky-600',
        bgColor: 'bg-sky-50 border-sky-100',
      },
    ],
    insiderTip: 'IC card tap-in/out calculates exact fare automatically — always cheaper than buying individual tickets. Add ¥2,000 when you arrive and top up at any station.',
  },

  bangkok: {
    modes: [
      {
        icon: <TrainFront size={18} />,
        name: 'BTS Skytrain',
        tip: 'The elevated rail covers Sukhumvit and Silom lines — fast, cool and cheap. Rabbit Card (like Oyster) saves time at every gate.',
        badge: 'Most popular',
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-100',
      },
      {
        icon: <TrainFront size={18} />,
        name: 'MRT (Subway)',
        tip: 'Connects to BTS at key interchange stations. Covers areas BTS doesn\'t reach including Chinatown, Silom and Lat Phrao.',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-100',
      },
      {
        icon: <Car size={18} />,
        name: 'Grab',
        tip: 'The default rideshare app in Bangkok — safe, metered and the driver comes to you. Always beats tuk-tuk prices for distances over 3 km.',
        badge: 'Best value',
        color: 'text-green-700',
        bgColor: 'bg-green-50 border-green-100',
      },
      {
        icon: <Ship size={18} />,
        name: 'Chao Phraya Ferry',
        tip: 'River express boats skip traffic entirely. Orange flag boats (BTS line) run every 15 min and cost ฿15–30. Best way to reach the old city temples.',
        badge: 'Fastest',
        color: 'text-teal-600',
        bgColor: 'bg-teal-50 border-teal-100',
      },
      {
        icon: <Plane size={18} />,
        name: 'Airport Transfer',
        tip: 'Suvarnabhumi: Airport Rail Link to Phaya Thai (30 min, ฿45) — fastest option. Grab is ฿300–500 and takes 45–90 min depending on traffic.',
        color: 'text-sky-600',
        bgColor: 'bg-sky-50 border-sky-100',
      },
    ],
    insiderTip: 'Never agree to a tuk-tuk going to a "gem store" or "special temple" — it\'s a scam. Grab or BTS for everything and you\'ll never overpay.',
  },

  paris: {
    modes: [
      {
        icon: <TrainFront size={18} />,
        name: 'Métro',
        tip: '16 lines cover the whole city. A Navigo weekly pass (Mon–Sun, €22.80) beats buying individual tickets if you\'re staying 4+ days.',
        badge: 'Most popular',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-100',
      },
      {
        icon: <TrainFront size={18} />,
        name: 'RER (Regional Express)',
        tip: 'Faster for crossing the city and reaching airports. RER B from CDG to Châtelet (30 min, €11.80) is by far the cheapest airport option.',
        badge: 'Fastest',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 border-purple-100',
      },
      {
        icon: <Bike size={18} />,
        name: 'Vélib Bikes',
        tip: '€3/day for unlimited 30-min e-bike rides between 1,400 stations. The app shows real-time dock availability — perfect for riverside rides.',
        badge: 'Best value',
        color: 'text-orange-500',
        bgColor: 'bg-orange-50 border-orange-100',
      },
      {
        icon: <Car size={18} />,
        name: 'Uber / Bolt / FreeNow',
        tip: 'All three operate in Paris. Taxis from official ranks (white roof light) are metered and legal — avoid unofficial cabs at CDG.',
        color: 'text-slate-600',
        bgColor: 'bg-slate-50 border-slate-100',
      },
      {
        icon: <Plane size={18} />,
        name: 'Airport Transfer',
        tip: 'CDG: RER B (30 min, €11.80). Orly: Orlyval shuttle + RER B (35 min, €13.50) or Orlybus to Denfert-Rochereau (30 min, €10.30).',
        color: 'text-sky-600',
        bgColor: 'bg-sky-50 border-sky-100',
      },
    ],
    insiderTip: 'Validate your Navigo or ticket at the START of every journey — inspectors check mid-trip and issue €50 fines on the spot. No grace period.',
  },

  nairobi: {
    modes: [
      {
        icon: <Car size={18} />,
        name: 'Uber / Bolt',
        tip: 'Both apps run 24/7 and are the safest option for tourists. Bolt is usually 15–20% cheaper — keep both installed for surge comparison.',
        badge: 'Most popular',
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-100',
      },
      {
        icon: <Bus size={18} />,
        name: 'Matatu',
        tip: 'The colourful minibuses are how 90% of Nairobians commute. Cheap (KSh 30–100) but crowded and routes require local knowledge — great for short hops.',
        badge: 'Best value',
        color: 'text-red-500',
        bgColor: 'bg-red-50 border-red-100',
      },
      {
        icon: <Bike size={18} />,
        name: 'Boda Boda (Moto)',
        tip: 'Motorcycle taxis zip through traffic for KSh 50–200. Use SafeBoda or Uber Moto for metered, rated riders — avoid hailing random bodas in unfamiliar areas.',
        color: 'text-orange-500',
        bgColor: 'bg-orange-50 border-orange-100',
      },
      {
        icon: <TrainFront size={18} />,
        name: 'SGR Train',
        tip: 'The modern Standard Gauge Railway runs Nairobi to Mombasa (4.5 h, KSh 1,000). Syokimau station is 20 min from the CBD by Uber.',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-100',
      },
      {
        icon: <Plane size={18} />,
        name: 'Airport Transfer',
        tip: 'JKIA is 15 km from CBD — Uber is KSh 1,200–1,800 and takes 25–60 min depending on traffic. Avoid unmarked taxis outside arrivals.',
        badge: 'Fastest',
        color: 'text-sky-600',
        bgColor: 'bg-sky-50 border-sky-100',
      },
    ],
    insiderTip: 'Nairobi traffic is brutal 7–9 am and 5–8 pm on Uhuru Highway. Schedule airport pickups early or late — budget 90 min during peak if coming from Westlands.',
  },
};

const GENERIC_TRANSIT: CityTransit = {
  modes: [
    {
      icon: <TrainFront size={18} />,
      name: 'Metro / Rail',
      tip: 'Get a reloadable transit card on arrival — it\'s almost always cheaper per trip than single tickets and works across bus and rail.',
      badge: 'Best value',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-100',
    },
    {
      icon: <Bus size={18} />,
      name: 'Local Bus',
      tip: 'Buses reach areas rail doesn\'t cover. Confirm the route number with a local or driver before boarding — stops often aren\'t signed in English.',
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-100',
    },
    {
      icon: <Car size={18} />,
      name: 'Rideshare',
      tip: 'Uber, Bolt or the local equivalent is almost always the safest and most price-transparent way to travel if you\'re new to a city.',
      badge: 'Most popular',
      color: 'text-slate-600',
      bgColor: 'bg-slate-50 border-slate-100',
    },
    {
      icon: <Bike size={18} />,
      name: 'Bike Share',
      tip: 'Most major cities now have docked or dockless bikes. Cheap for short trips and skips traffic entirely in congested centres.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 border-orange-100',
    },
    {
      icon: <Plane size={18} />,
      name: 'Airport Transfer',
      tip: 'Research your airport rail or bus link before you land — it\'s almost always faster and cheaper than a taxi. Shared shuttle can also be cost-effective.',
      color: 'text-sky-600',
      bgColor: 'bg-sky-50 border-sky-100',
    },
  ],
  insiderTip: 'The first 20 minutes off any flight are the most vulnerable to scam taxis and overcharging. Pre-book your transfer or use the official rideshare app before you exit arrivals.',
};

interface Props {
  cityName: string;
}

export default function TransitSection({ cityName }: Props) {
  const key = cityName.toLowerCase().trim();
  const data = CITY_DATA[key] ?? GENERIC_TRANSIT;
  const cityDisplay = cityName.charAt(0).toUpperCase() + cityName.slice(1);

  return (
    <div className="bg-surface rounded-card border border-border shadow-card overflow-hidden">
      {/* Header */}
      <div className="bg-primary px-6 py-5">
        <div className="flex items-center gap-2 mb-1">
          <TrainFront size={18} className="text-white/70" />
          <span className="font-mono text-xs text-white/60 uppercase tracking-widest">Transit</span>
        </div>
        <h2 className="font-display font-semibold text-white text-xl">
          Navigate {cityDisplay} Like a Local
        </h2>
        <p className="font-sans text-sm text-white/60 mt-0.5">
          How the locals actually get around — no tourist traps
        </p>
      </div>

      {/* Mode grid */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.modes.map((mode) => (
          <div
            key={mode.name}
            className={`rounded-xl border p-4 flex flex-col gap-2 transition-shadow hover:shadow-card-hover ${mode.bgColor}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={mode.color}>{mode.icon}</span>
                <span className="font-display font-semibold text-primary text-sm leading-tight">
                  {mode.name}
                </span>
              </div>
              {mode.badge && (
                <span className="shrink-0 font-mono text-xs bg-white/70 text-primary border border-primary/10 px-2 py-0.5 rounded-full">
                  {mode.badge}
                </span>
              )}
            </div>
            <p className="font-sans text-xs text-text-main leading-relaxed">{mode.tip}</p>
          </div>
        ))}
      </div>

      {/* Insider tip */}
      <div className="mx-5 mb-5 rounded-xl bg-accent/8 border border-accent/20 p-4 flex items-start gap-3">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
          <Lightbulb size={15} className="text-accent" />
        </div>
        <div>
          <p className="font-mono text-xs text-accent uppercase tracking-widest mb-1">Local Insider Tip</p>
          <p className="font-sans text-sm text-text-main leading-relaxed">{data.insiderTip}</p>
        </div>
      </div>
    </div>
  );
}
