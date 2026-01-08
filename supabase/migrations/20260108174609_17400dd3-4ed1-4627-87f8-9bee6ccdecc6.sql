-- 1. Criar função RPC set_user_role com bootstrap para primeiro admin
CREATE OR REPLACE FUNCTION public.set_user_role(target_user_id uuid, new_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count int;
  caller_is_admin boolean;
BEGIN
  -- Contar quantos admins existem
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  
  -- Verificar se o caller é admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO caller_is_admin;
  
  -- Se não há admins, permitir bootstrap (primeiro admin)
  -- Ou se o caller é admin, permitir alteração
  IF admin_count = 0 OR caller_is_admin THEN
    -- Upsert: inserir ou atualizar role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, new_role)
    ON CONFLICT (user_id) 
    DO UPDATE SET role = new_role;
  ELSE
    RAISE EXCEPTION 'Apenas administradores podem alterar roles';
  END IF;
END;
$$;

-- 2. Adicionar constraint unique em user_id se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_key'
  ) THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 3. Políticas RLS para profiles: Admin pode ver todos
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- 4. Políticas RLS para profiles: Admin pode atualizar todos
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
CREATE POLICY "Admin can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- 5. Função para listar todos os usuários (para admin)
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  nome text,
  role app_role,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Só admin pode chamar
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.user_id,
    u.email,
    p.nome,
    COALESCE(ur.role, 'student'::app_role) as role,
    p.created_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.user_id
  LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
  ORDER BY p.created_at DESC;
END;
$$;