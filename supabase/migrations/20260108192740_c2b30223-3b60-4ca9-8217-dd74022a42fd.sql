-- ===== FRIENDSHIP SYSTEM =====

-- 1) Friendships table (follow/friend requests)
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id)
);

-- 2) Indexes for performance
CREATE INDEX idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON public.friendships(addressee_id);
CREATE INDEX idx_friendships_status ON public.friendships(status);

-- 3) Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- 4) RLS Policies
-- Users can view friendships they're part of
CREATE POLICY "Users can view own friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Users can send friend requests
CREATE POLICY "Users can send friend requests"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id AND requester_id != addressee_id);

-- Users can update friendships they received (accept/block)
CREATE POLICY "Users can respond to friend requests"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = addressee_id OR auth.uid() = requester_id);

-- Users can delete friendships they're part of
CREATE POLICY "Users can remove friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- 5) Featured achievements showcase (3 slots)
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS featured_achievements UUID[] DEFAULT '{}';

-- 6) Make profiles searchable by name (public read for search)
CREATE POLICY "Anyone can search profiles by name"
  ON public.profiles FOR SELECT
  USING (true);

-- 7) Drop old restrictive policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- 8) Trigger for updated_at
CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
