
-- Add coins and customization to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS coins INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_avatar_id UUID,
ADD COLUMN IF NOT EXISTS current_frame_id UUID,
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'dark';

-- Create shop_items table
CREATE TABLE public.shop_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('avatar', 'frame', 'asset_pack', 'theme')),
  price INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  asset_download_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'Trophy',
  condition_type TEXT NOT NULL,
  condition_value TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  coin_reward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_inventory table (for purchased items)
CREATE TABLE public.user_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES public.shop_items(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Shop items: Anyone can view active items
CREATE POLICY "Anyone can view active shop items" ON public.shop_items
FOR SELECT USING (is_active = true);

-- Admin can manage shop items (permissive for now)
CREATE POLICY "Admins can insert shop items" ON public.shop_items
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update shop items" ON public.shop_items
FOR UPDATE USING (true);

CREATE POLICY "Admins can delete shop items" ON public.shop_items
FOR DELETE USING (true);

-- Achievements: Anyone can view
CREATE POLICY "Anyone can view achievements" ON public.achievements
FOR SELECT USING (true);

CREATE POLICY "Admins can insert achievements" ON public.achievements
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update achievements" ON public.achievements
FOR UPDATE USING (true);

CREATE POLICY "Admins can delete achievements" ON public.achievements
FOR DELETE USING (true);

-- User inventory: Users can view and manage their own
CREATE POLICY "Users can view their own inventory" ON public.user_inventory
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their inventory" ON public.user_inventory
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User achievements: Users can view and earn their own
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can earn achievements" ON public.user_achievements
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert initial achievements
INSERT INTO public.achievements (name, description, icon, condition_type, condition_value, xp_reward, coin_reward) VALUES
('Primeiro Passo', 'Complete sua primeira aula', 'Footprints', 'lesson_complete', '1', 50, 10),
('Estudante Dedicado', 'Complete 5 aulas', 'BookOpen', 'lesson_complete', '5', 100, 25),
('Mestre das Aulas', 'Complete 10 aulas', 'GraduationCap', 'lesson_complete', '10', 200, 50),
('Caçador de Bugs', 'Vença sua primeira Boss Battle', 'Bug', 'boss_defeat', '1', 100, 25),
('Exterminador', 'Vença 3 Boss Battles', 'Skull', 'boss_defeat', '3', 200, 50),
('Perfeccionista', 'Vença um Boss sem errar', 'Star', 'perfect_score', '1', 150, 50),
('Lente da Experiência', 'Complete o Módulo 1', 'Eye', 'module_complete', '1', 300, 100),
('Lente do Desafio', 'Complete o Módulo 2', 'Target', 'module_complete', '2', 300, 100),
('Lente do Arquiteto', 'Complete o Módulo 3', 'Compass', 'module_complete', '3', 300, 100),
('Lente do Engenheiro', 'Complete o Módulo 4', 'Wrench', 'module_complete', '4', 300, 100),
('Mestre Unimate', 'Complete todos os módulos', 'Crown', 'module_complete', '5', 500, 200);

-- Insert initial shop items
INSERT INTO public.shop_items (name, description, type, price, image_url) VALUES
('Avatar Robô', 'Um avatar robótico futurista', 'avatar', 100, 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=robot1'),
('Avatar Ninja', 'Um ninja misterioso', 'avatar', 150, 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=ninja'),
('Avatar Astronauta', 'Pronto para explorar', 'avatar', 200, 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=astro'),
('Avatar Hacker', 'Elite do código', 'avatar', 250, 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=hacker'),
('Moldura Neon', 'Brilho cyberpunk', 'frame', 75, '/frames/neon.png'),
('Moldura Dourada', 'Para os campeões', 'frame', 150, '/frames/gold.png'),
('Moldura Pixel', 'Estilo retrô', 'frame', 100, '/frames/pixel.png'),
('Pack Sprites Básico', 'Assets para seu jogo', 'asset_pack', 300, '/packs/basic.png'),
('Pack Sprites Pro', 'Assets profissionais', 'asset_pack', 500, '/packs/pro.png');
