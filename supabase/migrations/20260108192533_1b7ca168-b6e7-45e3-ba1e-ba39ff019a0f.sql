-- ===== UPDATE RLS POLICIES FOR CURRICULUM TABLES =====

-- MODULES --
DROP POLICY IF EXISTS "Authenticated users can view modules" ON public.modules;
DROP POLICY IF EXISTS "Admins can insert modules" ON public.modules;
DROP POLICY IF EXISTS "Admins can update modules" ON public.modules;
DROP POLICY IF EXISTS "Admins can delete modules" ON public.modules;

CREATE POLICY "Anyone can view modules"
  ON public.modules FOR SELECT
  USING (true);

CREATE POLICY "Admins full access modules"
  ON public.modules FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- LESSONS --
DROP POLICY IF EXISTS "Authenticated users can view lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can insert lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can update lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can delete lessons" ON public.lessons;

CREATE POLICY "Anyone can view lessons"
  ON public.lessons FOR SELECT
  USING (true);

CREATE POLICY "Admins full access lessons"
  ON public.lessons FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- QUIZZES --
DROP POLICY IF EXISTS "Authenticated users can view quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can insert quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can update quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can delete quizzes" ON public.quizzes;

CREATE POLICY "Anyone can view quizzes"
  ON public.quizzes FOR SELECT
  USING (true);

CREATE POLICY "Admins full access quizzes"
  ON public.quizzes FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ACHIEVEMENTS --
DROP POLICY IF EXISTS "Authenticated users can view achievements" ON public.achievements;
DROP POLICY IF EXISTS "Admins can insert achievements" ON public.achievements;
DROP POLICY IF EXISTS "Admins can update achievements" ON public.achievements;
DROP POLICY IF EXISTS "Admins can delete achievements" ON public.achievements;

CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  USING (true);

CREATE POLICY "Admins full access achievements"
  ON public.achievements FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- SHOP_ITEMS --
DROP POLICY IF EXISTS "Authenticated users can view active shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Admins can view all shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Admins can insert shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Admins can update shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Admins can delete shop items" ON public.shop_items;

CREATE POLICY "Anyone can view active shop items"
  ON public.shop_items FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins full access shop items"
  ON public.shop_items FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
