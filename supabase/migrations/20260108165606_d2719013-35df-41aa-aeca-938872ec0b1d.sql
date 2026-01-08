-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'student');

-- Create user_roles table (NOT on profiles to prevent privilege escalation)
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'student',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles: users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can manage all roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop existing permissive policies and create proper ones

-- MODULES
DROP POLICY IF EXISTS "Admins can delete modules" ON public.modules;
DROP POLICY IF EXISTS "Admins can insert modules" ON public.modules;
DROP POLICY IF EXISTS "Admins can update modules" ON public.modules;
DROP POLICY IF EXISTS "Anyone can view modules" ON public.modules;

CREATE POLICY "Authenticated users can view modules"
ON public.modules FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert modules"
ON public.modules FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update modules"
ON public.modules FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete modules"
ON public.modules FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- LESSONS
DROP POLICY IF EXISTS "Admins can delete lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can insert lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can update lessons" ON public.lessons;
DROP POLICY IF EXISTS "Anyone can view lessons" ON public.lessons;

CREATE POLICY "Authenticated users can view lessons"
ON public.lessons FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert lessons"
ON public.lessons FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update lessons"
ON public.lessons FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete lessons"
ON public.lessons FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- QUIZZES
DROP POLICY IF EXISTS "Admins can delete quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can insert quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can update quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Anyone can view quizzes" ON public.quizzes;

CREATE POLICY "Authenticated users can view quizzes"
ON public.quizzes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert quizzes"
ON public.quizzes FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update quizzes"
ON public.quizzes FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete quizzes"
ON public.quizzes FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- SHOP_ITEMS
DROP POLICY IF EXISTS "Admins can delete shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Admins can insert shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Admins can update shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Anyone can view active shop items" ON public.shop_items;

CREATE POLICY "Authenticated users can view active shop items"
ON public.shop_items FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins can view all shop items"
ON public.shop_items FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert shop items"
ON public.shop_items FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update shop items"
ON public.shop_items FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete shop items"
ON public.shop_items FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ACHIEVEMENTS
DROP POLICY IF EXISTS "Admins can delete achievements" ON public.achievements;
DROP POLICY IF EXISTS "Admins can insert achievements" ON public.achievements;
DROP POLICY IF EXISTS "Admins can update achievements" ON public.achievements;
DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;

CREATE POLICY "Authenticated users can view achievements"
ON public.achievements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert achievements"
ON public.achievements FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update achievements"
ON public.achievements FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete achievements"
ON public.achievements FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));