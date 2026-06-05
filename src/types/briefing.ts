export interface PaymentsData {
  apps: string[];
  foreign_cards: string;
  atm_tip: string;
  cash_norms: string;
}

export interface NeighbourhoodSafety {
  name: string;
  level: 'safe' | 'caution' | 'avoid';
  note: string;
}

export interface SafetyData {
  neighbourhoods: NeighbourhoodSafety[];
  best_for_first_timers: string;
  avoid_after_dark: string;
  key_tip: string;
}

export interface ScamData {
  name: string;
  description: string;
  how_locals_avoid: string;
}

export interface LanguagePhrase {
  phrase: string;
  phonetic: string;
  meaning: string;
}

export interface LanguageData {
  phrases: LanguagePhrase[];
  transport_vocab: string[];
  script_tip: string;
}

export interface InsiderData {
  tips: string[];
  etiquette_tip: string;
}

export interface CityBriefing {
  payments: PaymentsData;
  safety: SafetyData;
  scams: ScamData[];
  language: LanguageData;
  insider_tips: InsiderData;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'local';
  content: string;
  timestamp: Date;
}
