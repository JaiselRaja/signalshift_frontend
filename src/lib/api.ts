/**
 * Signal Shift Web — API client
 * Extends the admin's api.ts with all consumer endpoints
 * and adds silent 401 → refresh → retry logic.
 */

import type {
  AvailableSlot,
  BookingCreate,
  BookingRead,
  MembershipRead,
  MatchRead,
  PaymentRead,
  PriceBreakdown,
  RegistrationRead,
  RazorpayResponse,
  TeamRead,
  TeamStanding,
  TournamentRead,
  TurfRead,
  UserRead,
  UserUpdate,
} from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const TENANT_SLUG =
  process.env.NEXT_PUBLIC_TENANT_SLUG || "default";

// ─── Token management ────────────────────────────────────────────────────────

let accessToken: string | null = null;

export function setToken(token: string) {
  accessToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("ss_access_token", token);
    // Set hint cookie for middleware edge-routing
    document.cookie = `ss_auth_hint=1; path=/; max-age=86400; SameSite=Lax`;
  }
}

export function getToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem("ss_access_token");
  }
  return accessToken;
}

/** Sets a placeholder token so protected routes render without a real backend. Development only. */
export function setPreviewToken() {
  if (process.env.NODE_ENV !== "development") {
    console.warn("setPreviewToken() is only available in development mode.");
    return;
  }
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: "preview-user",
      tenant_id: "preview-tenant",
      role: "player",
      exp: Math.floor(Date.now() / 1000) + 3600,
      preview: true,
    })
  );
  setToken(`${header}.${payload}.preview`);
}

export function clearToken() {
  accessToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("ss_access_token");
    localStorage.removeItem("ss_refresh_token");
    document.cookie = "ss_auth_hint=; path=/; max-age=0";
  }
}

// ─── Error class ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

// ─── Silent refresh state ────────────────────────────────────────────────────

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

async function doRefresh(): Promise<string> {
  const refreshToken =
    typeof window !== "undefined"
      ? localStorage.getItem("ss_refresh_token")
      : null;

  if (!refreshToken) throw new ApiError(401, "No refresh token");

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) throw new ApiError(401, "Refresh failed");

  const data = await res.json();
  setToken(data.access_token);
  if (typeof window !== "undefined") {
    localStorage.setItem("ss_refresh_token", data.refresh_token);
  }
  return data.access_token;
}

// ─── Generic fetch ───────────────────────────────────────────────────────────

type FetchOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  noAuth?: boolean;
};

async function request<T>(
  endpoint: string,
  opts: FetchOptions = {},
  isRetry = false
): Promise<T> {
  const { method = "GET", body, headers = {}, noAuth = false } = opts;

  const token = getToken();
  if (token && !noAuth) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Slug": TENANT_SLUG,
      ...headers,
    },
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  // ── Silent refresh on 401 ──────────────────────────────────────────────────
  if (res.status === 401 && !noAuth && !isRetry) {
    if (isRefreshing) {
      // Queue this request until the in-flight refresh completes
      return new Promise<T>((resolve, reject) => {
        pendingQueue.push({
          resolve: (newToken) => {
            headers["Authorization"] = `Bearer ${newToken}`;
            resolve(request<T>(endpoint, { ...opts, headers }, true));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const newToken = await doRefresh();
      pendingQueue.forEach(({ resolve }) => resolve(newToken));
      pendingQueue = [];
      headers["Authorization"] = `Bearer ${newToken}`;
      return request<T>(endpoint, { ...opts, headers }, true);
    } catch (err) {
      pendingQueue.forEach(({ reject }) => reject(err));
      pendingQueue = [];
      clearToken();
      if (typeof window !== "undefined") {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  if (!res.ok) {
    let errorData: { message?: string; detail?: unknown } = {};
    try {
      errorData = await res.json();
    } catch {
      // no json body
    }
    throw new ApiError(
      res.status,
      errorData.message || `Request failed: ${res.status}`,
      errorData.detail
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── HTTP method shortcuts ───────────────────────────────────────────────────

export const api = {
  get: <T>(url: string, opts?: FetchOptions) =>
    request<T>(url, { ...opts, method: "GET" }),
  post: <T>(url: string, body?: unknown, opts?: FetchOptions) =>
    request<T>(url, { ...opts, method: "POST", body }),
  patch: <T>(url: string, body?: unknown, opts?: FetchOptions) =>
    request<T>(url, { ...opts, method: "PATCH", body }),
  put: <T>(url: string, body?: unknown, opts?: FetchOptions) =>
    request<T>(url, { ...opts, method: "PUT", body }),
  delete: <T>(url: string, opts?: FetchOptions) =>
    request<T>(url, { ...opts, method: "DELETE" }),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function sendOtp(email: string) {
  return api.post("/auth/otp/send", { email, tenant_slug: TENANT_SLUG }, { noAuth: true });
}

export async function verifyOtp(email: string, otp: string) {
  const data = await api.post<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>("/auth/otp/verify", { email, otp, tenant_slug: TENANT_SLUG }, { noAuth: true });
  setToken(data.access_token);
  if (typeof window !== "undefined") {
    localStorage.setItem("ss_refresh_token", data.refresh_token);
  }
  return data;
}

export async function devLogin(email: string, password: string) {
  const data = await api.post<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>("/auth/dev-login", { email, password, tenant_slug: TENANT_SLUG }, { noAuth: true });
  setToken(data.access_token);
  if (typeof window !== "undefined") {
    localStorage.setItem("ss_refresh_token", data.refresh_token);
  }
  return data;
}

export async function googleSignIn(credential: string) {
  const data = await api.post<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>("/auth/google", { credential, tenant_slug: TENANT_SLUG }, { noAuth: true });
  setToken(data.access_token);
  if (typeof window !== "undefined") {
    localStorage.setItem("ss_refresh_token", data.refresh_token);
  }
  return data;
}

export async function checkHealth() {
  try {
    const res = await fetch(
      (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/health"
    );
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getMe() {
  return api.get<UserRead>("/users/me");
}

export async function updateMe(body: Partial<UserUpdate>) {
  return api.patch<UserRead>("/users/me", body);
}

// ─── Turfs ────────────────────────────────────────────────────────────────────

export async function listTurfs(city?: string) {
  const q = city ? `?city=${encodeURIComponent(city)}` : "";
  return api.get<TurfRead[]>(`/turfs/${q}`);
}

export async function getTurf(turfId: string) {
  return api.get<TurfRead>(`/turfs/${turfId}`);
}

export async function getTurfAvailability(turfId: string, targetDate: string) {
  return api.get<AvailableSlot[]>(
    `/turfs/${turfId}/availability?target_date=${targetDate}`
  );
}

export async function getTurfAvailabilityRange(
  turfId: string,
  startDate: string,
  endDate: string
) {
  return api.get<Record<string, AvailableSlot[]>>(
    `/turfs/${turfId}/availability/range?start_date=${startDate}&end_date=${endDate}`
  );
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function previewPrice(body: BookingCreate) {
  return api.post<PriceBreakdown>("/bookings/preview-price", body);
}

export async function createBooking(body: BookingCreate) {
  return api.post<BookingRead>("/bookings/", body);
}

export async function getMyBookings() {
  return api.get<BookingRead[]>("/bookings/my");
}

export async function cancelBooking(bookingId: string, reason: string) {
  return api.post<BookingRead>(`/bookings/${bookingId}/cancel`, { reason });
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function initiatePayment(bookingId: string) {
  return api.post<PaymentRead>("/payments/initiate", { booking_id: bookingId });
}

export async function submitPaymentCallback(body: RazorpayResponse) {
  return api.post<PaymentRead>("/payments/callback", {
    razorpay_payment_id: body.razorpay_payment_id,
    razorpay_order_id: body.razorpay_order_id,
    razorpay_signature: body.razorpay_signature,
  });
}

export interface UpiInitiateResponse {
  payment_id: string;
  booking_id: string;
  amount: number;
  currency: string;
  upi_uri: string;
  upi_vpa: string;
  payee_name: string;
}

export async function initiateUpiPayment(bookingId: string) {
  return api.post<UpiInitiateResponse>("/payments/upi/initiate", { booking_id: bookingId });
}

export async function submitUpiUtr(paymentId: string, utr: string) {
  return api.post<PaymentRead>("/payments/upi/submit-utr", { payment_id: paymentId, utr });
}

// ─── Tournaments ──────────────────────────────────────────────────────────────

export async function listTournaments(status?: string) {
  const q = status ? `?status=${status}` : "";
  return api.get<TournamentRead[]>(`/tournaments/${q}`);
}

export async function getTournament(tournamentId: string) {
  return api.get<TournamentRead>(`/tournaments/${tournamentId}`);
}

export async function getTournamentStandings(
  tournamentId: string,
  groupName?: string
) {
  const q = groupName ? `?group_name=${encodeURIComponent(groupName)}` : "";
  return api.get<TeamStanding[]>(`/tournaments/${tournamentId}/standings${q}`);
}

export async function getTournamentMatches(
  tournamentId: string,
  roundName?: string
) {
  const q = roundName ? `?round_name=${encodeURIComponent(roundName)}` : "";
  return api.get<MatchRead[]>(`/tournaments/${tournamentId}/matches${q}`);
}

export async function registerTeam(tournamentId: string, teamId: string) {
  return api.post<RegistrationRead>(
    `/tournaments/${tournamentId}/register?team_id=${teamId}`
  );
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export async function createTeam(body: {
  name: string;
  slug: string;
  sport_type: string;
  logo_url?: string;
}) {
  return api.post<TeamRead>("/teams/", body);
}

export async function listTeams() {
  return api.get<TeamRead[]>("/teams/");
}

export async function getMyTeams() {
  return api.get<TeamRead[]>("/teams/my");
}

export async function updateTeam(teamId: string, body: { name?: string; logo_url?: string | null; is_active?: boolean }) {
  return api.patch<TeamRead>(`/teams/${teamId}`, body);
}

export interface UserSummary {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

export async function searchUsers(q: string, limit = 10) {
  const query = encodeURIComponent(q);
  return api.get<UserSummary[]>(`/users/search?q=${query}&limit=${limit}`);
}

export async function getTeam(teamId: string) {
  return api.get<TeamRead>(`/teams/${teamId}`);
}

export async function getTeamMembers(teamId: string) {
  return api.get<MembershipRead[]>(`/teams/${teamId}/members`);
}

export async function addTeamMember(
  teamId: string,
  userId: string,
  role = "player"
) {
  return api.post<MembershipRead>(`/teams/${teamId}/members`, {
    user_id: userId,
    role,
  });
}

export async function removeTeamMember(teamId: string, userId: string) {
  return api.delete<void>(`/teams/${teamId}/members/${userId}`);
}
