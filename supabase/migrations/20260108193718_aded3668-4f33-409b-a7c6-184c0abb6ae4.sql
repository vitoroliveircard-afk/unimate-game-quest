-- Free Edit Mode (safe): allow any authenticated user to CRUD content tables.
-- NOTE: We intentionally KEEP RLS enabled on user-owned/PII tables (profiles, user_roles, user_progress, etc.) to prevent account takeover/data leaks.

-- =========
-- achievements
-- =========
DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;
DROP POLICY IF EXISTS "Admins full access achievements" ON public.achievements;

CREATE POLICY "Authenticated full access achievements"
ON public.achievements
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- ========
-- modules
-- ========
DROP POLICY IF EXISTS "Anyone can view modules" ON public.modules;
DROP POLICY IF EXISTS "Admins full access modules" ON public.modules;

CREATE POLICY "Authenticated full access modules"
ON public.modules
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- ========
-- lessons
-- ========
DROP POLICY IF EXISTS "Anyone can view lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins full access lessons" ON public.lessons;

CREATE POLICY "Authenticated full access lessons"
ON public.lessons
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- =======
-- quizzes
-- =======
DROP POLICY IF EXISTS "Anyone can view quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins full access quizzes" ON public.quizzes;

CREATE POLICY "Authenticated full access quizzes"
ON public.quizzes
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- =========
-- shop_items
-- =========
DROP POLICY IF EXISTS "Anyone can view active shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Admins full access shop items" ON public.shop_items;

CREATE POLICY "Authenticated full access shop_items"
ON public.shop_items
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
