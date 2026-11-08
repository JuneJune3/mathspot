CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  message text NOT NULL,
  sender_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contact_msg_len CHECK (char_length(message) BETWEEN 1 AND 2000 AND char_length(name) <= 100)
);
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact: anyone can send" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (sender_id IS NULL OR sender_id = auth.uid());
CREATE POLICY "contact: admin reads" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "contact: admin deletes" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));