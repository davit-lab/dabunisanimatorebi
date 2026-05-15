
-- 1. Bookings: add user_id, city, lat/lng
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS address_lat double precision,
  ADD COLUMN IF NOT EXISTS address_lng double precision;

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);

-- Allow logged-in users to read their own bookings
DROP POLICY IF EXISTS "users read own bookings" ON public.bookings;
CREATE POLICY "users read own bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own notifications" ON public.notifications;
CREATE POLICY "users read own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users update own notifications" ON public.notifications;
CREATE POLICY "users update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admins read all notifications" ON public.notifications;
CREATE POLICY "admins read all notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "admins manage notifications" ON public.notifications;
CREATE POLICY "admins manage notifications"
ON public.notifications FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Trigger: notify user when booking confirmed
CREATE OR REPLACE FUNCTION public.notify_booking_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL
     AND NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status = 'confirmed' THEN
    INSERT INTO public.notifications (user_id, type, title, body, booking_id)
    VALUES (
      NEW.user_id,
      'booking_confirmed',
      'ჯავშანი დადასტურდა',
      'თქვენი ჯავშანი ' || to_char(NEW.booking_date, 'DD.MM.YYYY') || ' დადასტურებულია.',
      NEW.id
    );
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_booking_status ON public.bookings;
CREATE TRIGGER trg_notify_booking_status
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_booking_status_change();

-- 4. Realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
