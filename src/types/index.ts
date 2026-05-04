// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export type UserRole = "super_admin" | "turf_admin" | "team_manager" | "player";

export interface UserRead {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface UserUpdate {
  full_name?: string;
  phone?: string;
  avatar_url?: string | null;
  preferences?: Record<string, unknown>;
}

// ─── Turfs ────────────────────────────────────────────────────────────────────

export interface TurfRead {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  sport_types: string[];
  address: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  amenities: { name: string; available?: boolean; icon?: string }[];
  operating_hours: Record<string, { open: string; close: string }>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AvailableSlot {
  date: string;           // "YYYY-MM-DD"
  start_time: string;     // "HH:MM:SS"
  end_time: string;       // "HH:MM:SS"
  duration_mins: number;
  slot_type: SlotType;
  base_price: number;
  computed_price: number;
  is_available: boolean;
  remaining_capacity: number;
}

export type SlotType = "peak" | "offpeak" | "regular" | "blocked" | "maintenance";

// ─── Bookings ─────────────────────────────────────────────────────────────────

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show"
  | "refund_pending"
  | "refunded";

export type BookingType =
  | "regular"
  | "tournament"
  | "practice"
  | "event"
  | "subscription";

export interface BookingCreate {
  turf_id: string;
  booking_date: string;   // "YYYY-MM-DD"
  start_time: string;     // "HH:MM:SS"
  end_time: string;       // "HH:MM:SS"
  booking_type?: BookingType;
  team_id?: string | null;
  coupon_code?: string | null;
  notes?: string | null;
}

export interface BookingRead {
  id: string;
  tenant_id: string;
  turf_id: string;
  user_id: string;
  team_id: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_mins: number;
  status: BookingStatus;
  booking_type: BookingType;
  base_price: number;
  discount_amount: number;
  tax_amount: number;
  final_price: number;
  currency: string;
  cancelled_at: string | null;
  cancel_reason: string | null;
  refund_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppliedPricingRule {
  rule_name: string;
  rule_type: string;
  adjustment_type: string;
  adjustment_value: number;
  effect_amount: number;
}

export interface PriceBreakdown {
  base_price: number;
  applied_rules: AppliedPricingRule[];
  discount: number;
  coupon_discount: number;
  subtotal: number;
  tax: number;
  total: number;
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export type PaymentStatus =
  | "initiated"
  | "processing"
  | "success"
  | "failed"
  | "refunded"
  | "partially_refunded";

export interface PaymentRead {
  id: string;
  booking_id: string;
  user_id: string;
  gateway: string;
  gateway_txn_id: string | null;
  gateway_order_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: string | null;
  refund_id: string | null;
  refund_amount: number | null;
  created_at: string;
  updated_at: string;
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export type TeamMemberRole = "manager" | "captain" | "player";

export interface TeamRead {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  sport_type: string;
  logo_url: string | null;
  captain_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface MembershipRead {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamMemberRole;
  joined_at: string;
  is_active: boolean;
  user_name?: string | null;
  user_email?: string | null;
  user_avatar_url?: string | null;
}

// ─── Tournaments ──────────────────────────────────────────────────────────────

export type TournamentFormat =
  | "league"
  | "knockout"
  | "group_knockout"
  | "round_robin"
  | "swiss"
  | "custom";

export type TournamentStatus =
  | "draft"
  | "registration_open"
  | "registration_closed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type MatchStatus =
  | "scheduled"
  | "live"
  | "completed"
  | "cancelled"
  | "postponed"
  | "walkover";

export interface RuleSetRead {
  id: string;
  tournament_id: string;
  rule_category: string;
  rule_name: string;
  priority: number;
  rule_definition: Record<string, unknown>;
  is_active: boolean;
}

export interface TournamentRead {
  id: string;
  tenant_id: string;
  turf_id: string | null;
  name: string;
  slug: string;
  sport_type: string;
  format: TournamentFormat;
  status: TournamentStatus;
  tournament_starts: string;
  tournament_ends: string | null;
  registration_starts: string | null;
  registration_ends: string | null;
  max_teams: number | null;
  min_teams: number;
  entry_fee: number | null;
  prize_pool: Record<string, unknown>;
  config: Record<string, unknown>;
  rule_sets: RuleSetRead[];
  created_at: string;
}

export interface TeamStanding {
  team_id: string;
  team_name: string;
  group_name: string | null;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  hours_played: number;
  custom_score: number | null;
  is_qualified: boolean;
  rank: number | null;
}

export interface MatchRead {
  id: string;
  tournament_id: string;
  booking_id: string | null;
  round_name: string;
  group_name: string | null;
  match_number: number | null;
  home_team_id: string | null;
  away_team_id: string | null;
  scheduled_at: string | null;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  winner_team_id: string | null;
  is_draw: boolean;
  extra_data: Record<string, unknown>;
}

export interface RegistrationRead {
  id: string;
  tournament_id: string;
  team_id: string;
  registered_by: string;
  status: string;
  payment_status: string;
  seed: number | null;
  group_name: string | null;
  created_at: string;
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export type PlanType = "monthly" | "daily";

export interface PlanRead {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  tagline: string | null;
  plan_type: PlanType;
  price: number | string; // backend serializes Decimal as string
  price_unit: string;
  hours_per_month: number | null;
  discount_pct: number | null;
  advance_window_days: number | null;
  slot_window_start: string | null; // "HH:MM:SS" or null
  slot_window_end: string | null;
  perks: string[];
  featured: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanCreate {
  code: string;
  name: string;
  tagline?: string | null;
  plan_type: PlanType;
  price: number;
  price_unit: string;
  hours_per_month?: number | null;
  discount_pct?: number | null;
  advance_window_days?: number | null;
  perks: string[];
  featured?: boolean;
  display_order?: number;
  is_active?: boolean;
}

export interface PlanUpdate {
  name?: string;
  tagline?: string | null;
  plan_type?: PlanType;
  price?: number;
  price_unit?: string;
  hours_per_month?: number | null;
  discount_pct?: number | null;
  advance_window_days?: number | null;
  perks?: string[];
  featured?: boolean;
  display_order?: number;
  is_active?: boolean;
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export type SubscriptionStatus = "pending" | "active" | "cancelled" | "expired";

export interface SubscriptionSlotInput {
  day_of_week: number; // 0=Mon … 6=Sun
  start_time: string; // "HH:MM:SS" or "HH:MM"
  end_time?: string | null;
}

export interface SubscriptionInitiate {
  plan_id: string;
  turf_id: string;
  slots: SubscriptionSlotInput[];
}

export interface SubscriptionSlotRead {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface SubscriptionRead {
  id: string;
  tenant_id: string;
  user_id: string;
  plan_id: string;
  turf_id: string;
  status: SubscriptionStatus;
  starts_on: string | null;
  expires_on: string | null;
  payment_id: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
  slots: SubscriptionSlotRead[];
  plan?: {
    id: string;
    code: string;
    name: string;
    plan_type: string;
    price: number | string;
    price_unit: string;
    hours_per_month: number | null;
  } | null;
  payment?: {
    id: string;
    status: string;
    utr: string | null;
    amount: number | string;
    currency: string;
  } | null;
}

export interface SubscriptionInitiateResponse {
  subscription: SubscriptionRead;
  payment_id: string;
  amount: number;
  currency: string;
  upi_uri: string;
  upi_vpa: string;
  payee_name: string;
}

export interface SubscriptionAvailabilitySlot {
  start_time: string;
  end_time: string;
  available: boolean;
  reason: string | null;
}

// ─── Google Identity Services (global type declaration) ──────────────────────

export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
  clientId: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number;
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              logo_alignment?: "left" | "center";
            }
          ) => void;
          prompt: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

// ─── Razorpay (global type declaration) ──────────────────────────────────────

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: { color?: string };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayInstance {
  open: () => void;
  close: () => void;
}
