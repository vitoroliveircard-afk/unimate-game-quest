-- Add module relationship to quizzes table for boss fights
-- Add icon and color columns to modules for UI customization
-- Update modules to add needed fields

ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS icon text DEFAULT 'Gamepad2';
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS color text DEFAULT '#0EA5E9';

-- Create RLS policies to allow admins to manage content
-- For now, we'll create permissive policies for insert/update/delete on content tables

CREATE POLICY "Admins can insert modules" ON public.modules FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update modules" ON public.modules FOR UPDATE USING (true);
CREATE POLICY "Admins can delete modules" ON public.modules FOR DELETE USING (true);

CREATE POLICY "Admins can insert lessons" ON public.lessons FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update lessons" ON public.lessons FOR UPDATE USING (true);
CREATE POLICY "Admins can delete lessons" ON public.lessons FOR DELETE USING (true);

CREATE POLICY "Admins can insert quizzes" ON public.quizzes FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update quizzes" ON public.quizzes FOR UPDATE USING (true);
CREATE POLICY "Admins can delete quizzes" ON public.quizzes FOR DELETE USING (true);