// Database interfaces for Totalum tables
// Auto-generated based on database schema

// =============================================================================
// ENUMS & TYPES
// =============================================================================

// User roles enum
export type UserRole = "organizador" | "padre" | "peque";

// User status enum
export type UserStatus = "active" | "suspended";

// Activity status enum
export type ActivityStatus = "draft" | "published" | "cancelled";

// Activity modality enum
export type ActivityModality = "presencial" | "online" | "en-casa";

// Activity visibility enum
export type ActivityVisibility = "public" | "unlisted";

// Activity category enum
export type ActivityCategory = "ciencia" | "arte" | "musica" | "naturaleza" | "lectura" | "experimentos";

// Booking status enum
export type BookingStatus = "reserved" | "paid" | "cancelled" | "checked_in";

// Ticket status enum
export type TicketStatus = "active" | "used" | "cancelled";

// Session status enum
export type SessionStatus = "active" | "cancelled" | "sold_out";

// Currency enum
export type Currency = "eur" | "usd";

// Module content type enum
export type ModuleContentType = "video" | "game" | "quiz" | "activity";

// Module difficulty enum
export type ModuleDifficulty = "easy" | "medium" | "hard";

// Yes/No option type
export type YesNo = "yes" | "no";

// =============================================================================
// FILE TYPE
// =============================================================================

// File type for Totalum
export interface TotalumFile {
  url: string;
  name: string;
}

// =============================================================================
// AUTH TABLES
// =============================================================================

// User table interface
export interface User {
  _id: string;
  email: string;
  name: string;
  last_name?: string;
  role: UserRole;
  email_verified?: number;
  status: UserStatus;
  image?: string;
  avatar?: TotalumFile;
  createdAt: string;
  updatedAt: string;
}

// Session table interface (auth)
export interface AuthSession {
  _id: string;
  user_id: string;
  token: string;
  expires_at: string;
  ip_address?: string;
  user_agent?: string;
  createdAt: string;
  updatedAt: string;
}

// Account table interface
export interface Account {
  _id: string;
  user_id: string;
  account_id: string;
  provider_id: string;
  password?: string;
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  access_token_expires_at?: string;
  refresh_token_expires_at?: string;
  scope?: string;
  createdAt: string;
  updatedAt: string;
}

// Verification table interface
export interface Verification {
  _id: string;
  identifier: string;
  value: string;
  expires_at: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// ORGANIZER TABLES
// =============================================================================

// Organizer Profile table interface
export interface OrganizerProfile {
  _id: string;
  user: string | User;
  brand_name?: string;
  phone?: string;
  bio?: string;
  website?: string;
  payout_info?: string; // JSON string
  verified: YesNo;
  logo?: TotalumFile;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// ACTIVITY TABLES
// =============================================================================

// Activity table interface
export interface Activity {
  _id: string;
  organizer_user: string | User;
  title: string;
  slug?: string;
  short_description?: string;
  description?: string;
  category?: ActivityCategory;
  age_min?: number;
  age_max?: number;
  modality: ActivityModality;
  location_name?: string;
  location_address?: string;
  city?: string;
  online_link?: string;
  // Legacy fields for simple activities (single session)
  start_date_time?: string;
  end_date_time?: string;
  capacity_total?: number;
  capacity_available?: number;
  price_cents?: number;
  // New fields
  images?: TotalumFile[];
  cover_image_url?: string;
  status: ActivityStatus;
  visibility?: ActivityVisibility;
  published_at?: string;
  requirements?: string;
  cancellation_policy?: string;
  createdAt: string;
  updatedAt: string;
}

// Activity Session table interface (for multi-session activities)
export interface ActivitySession {
  _id: string;
  activity: string | Activity;
  start_date_time: string;
  end_date_time: string;
  capacity_total: number;
  capacity_available: number;
  price_cents: number;
  currency: Currency;
  sales_start?: string;
  sales_end?: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
}

// Activity Draft Checklist table interface
export interface ActivityDraftChecklist {
  _id: string;
  activity: string | Activity;
  has_title: YesNo;
  has_cover: YesNo;
  has_description: YesNo;
  has_session: YesNo;
  has_capacity: YesNo;
  has_price: YesNo;
  has_location: YesNo;
  completion_percent: number;
  createdAt: string;
  updatedAt: string;
}

// Activity Stats table interface
export interface ActivityStats {
  _id: string;
  activity: string | Activity;
  session?: string | ActivitySession;
  views: number;
  clicks_reserve: number;
  bookings_count: number;
  revenue_cents: number;
  checkins_count: number;
  last_updated_at: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// BOOKING & TICKET TABLES
// =============================================================================

// Booking table interface
export interface Booking {
  _id: string;
  activity: string | Activity;
  session?: string | ActivitySession;
  parent_user: string | User;
  child_user?: string | User;
  quantity: number;
  status: BookingStatus;
  booked_at: string;
  cancellation_at?: string;
  createdAt: string;
  updatedAt: string;
}

// Ticket table interface
export interface Ticket {
  _id: string;
  booking: string | Booking;
  ticket_code: string;
  issued_at: string;
  used_at?: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// FAMILY TABLES
// =============================================================================

// Parent-Child link table interface
export interface ParentChildLink {
  _id: string;
  parent_user: string | User;
  child_user: string | User;
  pin_code: string;
  createdAt: string;
  updatedAt: string;
}

// Calendar item table interface
export interface CalendarItem {
  _id: string;
  parent_user: string | User;
  activity: string | Activity;
  booking: string | Booking;
  title: string;
  start_date_time: string;
  end_date_time: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// KID LEARNING TABLES
// =============================================================================

// Kid category table interface
export interface KidCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Kid module table interface
export interface KidModule {
  _id: string;
  category: string | KidCategory;
  title: string;
  description?: string;
  content_type: ModuleContentType;
  thumbnail?: TotalumFile;
  content_url?: string;
  duration_minutes?: number;
  difficulty: ModuleDifficulty;
  age_min?: number;
  age_max?: number;
  order: number;
  is_active: YesNo;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// HELPER TYPES
// =============================================================================

// Helper type for populated references
export type WithPopulated<T, K extends keyof T, P> = Omit<T, K> & { [key in K]: P };

// Activity with organizer populated
export type ActivityWithOrganizer = WithPopulated<Activity, "organizer_user", User>;

// Booking with all relations populated
export type BookingWithRelations = WithPopulated<
  WithPopulated<
    WithPopulated<Booking, "activity", Activity>,
    "parent_user",
    User
  >,
  "child_user",
  User
>;

// Ticket with booking populated
export type TicketWithBooking = WithPopulated<Ticket, "booking", BookingWithRelations>;

// Activity session with activity populated
export type SessionWithActivity = WithPopulated<ActivitySession, "activity", Activity>;

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

// Generic API response
export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Paginated response
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: PaginationMeta;
}

// =============================================================================
// FORM DATA TYPES (for wizards and forms)
// =============================================================================

// Activity creation/edit form data
export interface ActivityFormData {
  // Step 1: Basics
  title: string;
  category: ActivityCategory;
  age_min: number;
  age_max: number;
  modality: ActivityModality;
  // Step 2: Images
  cover_image?: File | TotalumFile;
  gallery_images?: (File | TotalumFile)[];
  // Step 3: Description
  short_description: string;
  description: string;
  requirements?: string;
  // Step 4: Sessions
  sessions: SessionFormData[];
  // Step 5: Location
  location_name?: string;
  location_address?: string;
  city?: string;
  online_link?: string;
  cancellation_policy?: string;
}

// Session form data
export interface SessionFormData {
  id?: string; // For existing sessions
  start_date_time: string;
  end_date_time: string;
  capacity_total: number;
  price_cents: number;
  currency: Currency;
  sales_start?: string;
  sales_end?: string;
}

// Booking form data
export interface BookingFormData {
  activity_id: string;
  session_id?: string;
  child_user_id: string;
  quantity: number;
}

// Child creation form data
export interface ChildFormData {
  name: string;
  avatar?: string;
  pin_code: string;
}

// =============================================================================
// AI EXTRACTION TYPES (for poster scanning)
// =============================================================================

// Confidence level for extracted data
export type ConfidenceLevel = "high" | "medium" | "low";

// Source of extracted data
export type ExtractionSource = "ocr" | "inference";

// Single extracted field with metadata
export interface ExtractedField<T> {
  value: T | null;
  confidence: number; // 0-1
  source: ExtractionSource;
}

// Extended category options for AI extraction
export type ExtendedCategory =
  | "ciencia"
  | "arte"
  | "musica"
  | "lectura"
  | "naturaleza"
  | "deporte"
  | "tecnologia"
  | "idiomas"
  | "experimentos"
  | "otra";

// Format options for AI extraction
export type ExtractedFormat = "presencial" | "online";

// Full extracted event data from poster
export interface ExtractedEventData {
  title: ExtractedField<string>;
  category: ExtractedField<ExtendedCategory>;
  format: ExtractedField<ExtractedFormat>;
  ageMin: ExtractedField<number>;
  ageMax: ExtractedField<number>;
  dateStart: ExtractedField<string>; // YYYY-MM-DD
  timeStart: ExtractedField<string>; // HH:MM
  dateEnd: ExtractedField<string>;
  timeEnd: ExtractedField<string>;
  durationMinutes: ExtractedField<number>;
  locationName: ExtractedField<string>;
  address: ExtractedField<string>;
  city: ExtractedField<string>;
  price: ExtractedField<string>;
  capacity: ExtractedField<number>;
  organizerName: ExtractedField<string>;
  contactPhone: ExtractedField<string>;
  contactEmail: ExtractedField<string>;
  website: ExtractedField<string>;
  materials: ExtractedField<string[]>;
  requirements: ExtractedField<string[]>;
  tags: ExtractedField<string[]>;
  notes: ExtractedField<string>;
}

// Generated content from AI
export interface GeneratedEventContent {
  shortDescription: string;
  description: string;
  bulletHighlights: string[];
  faqs: { question: string; answer: string }[];
  cancellationPolicy: string;
}

// Full AI analysis result
export interface PosterAnalysisResult {
  extractedData: ExtractedEventData;
  generatedContent: GeneratedEventContent;
  rawOcrText: string;
  processingMetadata: {
    processingTimeMs: number;
    modelUsed: string;
    imageHash?: string;
    confidenceScore: number; // Average confidence across all fields
  };
}

// AI field status for UI
export interface AIFieldStatus {
  fieldName: string;
  applied: boolean;
  originalValue: unknown;
  aiValue: unknown;
  confidence: number;
  source: ExtractionSource;
}

// Form state with AI tracking
export interface ActivityFormDataWithAI extends ActivityFormData {
  aiAssisted: boolean;
  aiFieldStatuses?: AIFieldStatus[];
  posterImageUrl?: string;
  rawExtractedData?: ExtractedEventData;
}
