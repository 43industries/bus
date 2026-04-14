-- Trip lifecycle: status events, trips, event log, notification audit.
-- Implements the school -> home -> school bus loop with status tracking.

-- Status enum for the full loop
DO $$ BEGIN
  CREATE TYPE public.trip_status AS ENUM (
    'LEFT_SCHOOL',
    'EN_ROUTE_TO_HOME',
    'ARRIVED_HOME_STOP',
    'LEFT_HOME_AREA',
    'RETURNING_TO_SCHOOL',
    'ARRIVED_SCHOOL'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- One row per bus loop (school -> home -> school)
CREATE TABLE IF NOT EXISTS public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id text NOT NULL,
  current_status public.trip_status NOT NULL DEFAULT 'LEFT_SCHOOL',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trips_bus_id ON public.trips (bus_id);
CREATE INDEX IF NOT EXISTS idx_trips_bus_active ON public.trips (bus_id, completed_at)
  WHERE completed_at IS NULL;

-- Audit log of every status transition (one row per event, no duplicates)
CREATE TABLE IF NOT EXISTS public.trip_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips (id) ON DELETE CASCADE,
  status public.trip_status NOT NULL,
  lat double precision,
  lng double precision,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trip_id, status)
);

CREATE INDEX IF NOT EXISTS idx_trip_events_trip ON public.trip_events (trip_id, recorded_at);

-- Notification delivery audit trail
CREATE TABLE IF NOT EXISTS public.notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES public.trips (id) ON DELETE SET NULL,
  trip_event_id uuid REFERENCES public.trip_events (id) ON DELETE SET NULL,
  bus_id text NOT NULL,
  student_id uuid REFERENCES public.student_profiles (id) ON DELETE SET NULL,
  guardian_id uuid REFERENCES public.parent_guardians (id) ON DELETE SET NULL,
  channel text NOT NULL CHECK (channel IN ('sms', 'push')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  message text,
  provider_sid text,
  error_detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_log_trip ON public.notification_log (trip_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_guardian ON public.notification_log (guardian_id, created_at);

-- RLS
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

-- Trips and events readable by both anon (parent tracking without login) and authenticated
DROP POLICY IF EXISTS trips_select_anon ON public.trips;
CREATE POLICY trips_select_anon
  ON public.trips FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS trip_events_select_anon ON public.trip_events;
CREATE POLICY trip_events_select_anon
  ON public.trip_events FOR SELECT TO anon, authenticated
  USING (true);

-- notification_log: service_role only (no client-facing policies)

-- Realtime: parents and fleet get live status changes via subscription
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
