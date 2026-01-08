import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusCircle, Edit2, Trash2, ChevronDown, ChevronRight, 
  BookOpen, Gamepad2, Swords, ArrowLeft, Save, X, GripVertical,
  ShoppingBag, Trophy, Coins, Image, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Logo } from '@/components/Logo';
import { useModules, useCreateModule, useUpdateModule, useDeleteModule } from '@/hooks/useModules';
import { useLessons, useCreateLesson, useUpdateLesson, useDeleteLesson } from '@/hooks/useLessons';
import { useQuizzes, useCreateQuiz, useUpdateQuiz, useDeleteQuiz } from '@/hooks/useQuizzes';
import { 
  useAllShopItems, useCreateShopItem, useUpdateShopItem, useDeleteShopItem, 
  type ShopItem 
} from '@/hooks/useShop';
import { 
  useAchievements, useCreateAchievement, useUpdateAchievement, useDeleteAchievement,
  type Achievement 
} from '@/hooks/useAchievements';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { Module } from '@/hooks/useModules';
import type { Lesson } from '@/hooks/useLessons';
import type { Quiz } from '@/hooks/useQuizzes';
import { UsersTab } from '@/components/admin/UsersTab';

type Tab = 'modules' | 'quizzes' | 'shop' | 'achievements' | 'users';

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('modules');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editingShopItem, setEditingShopItem] = useState<ShopItem | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [newModuleOpen, setNewModuleOpen] = useState(false);
  const [newLessonModuleId, setNewLessonModuleId] = useState<string | null>(null);
  const [selectedQuizModuleId, setSelectedQuizModuleId] = useState<string | null>(null);
  const [newShopItemOpen, setNewShopItemOpen] = useState(false);
  const [newAchievementOpen, setNewAchievementOpen] = useState(false);

  const { data: modules = [], isLoading: modulesLoading } = useModules();
  const { data: allLessons = [] } = useLessons();
  const { data: quizzes = [] } = useQuizzes(selectedQuizModuleId || undefined);
  const { data: shopItems = [], isLoading: shopLoading } = useAllShopItems();
  const { data: achievements = [], isLoading: achievementsLoading } = useAchievements();
  
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();
  const createQuiz = useCreateQuiz();
  const updateQuiz = useUpdateQuiz();
  const deleteQuiz = useDeleteQuiz();
  const createShopItem = useCreateShopItem();
  const updateShopItem = useUpdateShopItem();
  const deleteShopItem = useDeleteShopItem();
  const createAchievement = useCreateAchievement();
  const updateAchievement = useUpdateAchievement();
  const deleteAchievement = useDeleteAchievement();

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getLessonsForModule = (moduleId: string) => 
    allLessons.filter((l) => l.module_id === moduleId);

  const formatError = (e: unknown) => {
    if (e && typeof e === 'object' && 'message' in e) return String((e as any).message);
    return 'Sem detalhes.';
  };

  const handleSaveModule = async (data: Partial<Module> & { id?: string }) => {
    try {
      if (data.id) {
        await updateModule.mutateAsync({ id: data.id, ...data });
        toast({ title: 'Módulo atualizado!' });
      } else {
        await createModule.mutateAsync({
          title: data.title || 'Novo Módulo',
          description: data.description,
          order_index: modules.length,
          is_locked: data.is_locked ?? true,
          color: data.color || '#0EA5E9',
          icon: data.icon || 'Gamepad2',
        });
        toast({ title: 'Módulo criado!' });
      }
      setEditingModule(null);
      setNewModuleOpen(false);
    } catch (e) {
      toast({
        title: 'Erro ao salvar módulo',
        description: formatError(e),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Tem certeza? Isso excluirá todas as aulas deste módulo.')) return;
    try {
      await deleteModule.mutateAsync(id);
      toast({ title: 'Módulo excluído!' });
    } catch (e) {
      toast({
        title: 'Erro ao excluir módulo',
        description: formatError(e),
        variant: 'destructive',
      });
    }
  };

  const handleSaveLesson = async (data: Partial<Lesson> & { id?: string; module_id: string }) => {
    try {
      if (data.id) {
        await updateLesson.mutateAsync({ id: data.id, ...data });
        toast({ title: 'Aula atualizada!' });
      } else {
        const moduleLessons = getLessonsForModule(data.module_id);
        await createLesson.mutateAsync({
          title: data.title || 'Nova Aula',
          module_id: data.module_id,
          video_url: data.video_url,
          content_text: data.content_text,
          order_index: moduleLessons.length,
          xp_reward: data.xp_reward || 100,
        });
        toast({ title: 'Aula criada!' });
      }
      setEditingLesson(null);
      setNewLessonModuleId(null);
    } catch (e) {
      toast({
        title: 'Erro ao salvar aula',
        description: formatError(e),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Excluir esta aula?')) return;
    try {
      await deleteLesson.mutateAsync(id);
      toast({ title: 'Aula excluída!' });
    } catch (e) {
      toast({
        title: 'Erro ao excluir aula',
        description: formatError(e),
        variant: 'destructive',
      });
    }
  };

  const handleSaveQuiz = async (data: Partial<Quiz> & { id?: string }) => {
    try {
      if (data.id) {
        await updateQuiz.mutateAsync({ id: data.id, ...data });
        toast({ title: 'Pergunta atualizada!' });
      } else {
        await createQuiz.mutateAsync({
          module_id: selectedQuizModuleId,
          question: data.question || 'Nova pergunta',
          options_json: data.options_json || [],
          correct_answer: data.correct_answer || 0,
          explanation: data.explanation,
          image_url: data.image_url,
        });
        toast({ title: 'Pergunta criada!' });
      }
      setEditingQuiz(null);
    } catch (e) {
      toast({
        title: 'Erro ao salvar pergunta',
        description: formatError(e),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Excluir esta pergunta?')) return;
    try {
      await deleteQuiz.mutateAsync(id);
      toast({ title: 'Pergunta excluída!' });
    } catch (e) {
      toast({
        title: 'Erro ao excluir pergunta',
        description: formatError(e),
        variant: 'destructive',
      });
    }
  };

  const handleSaveShopItem = async (data: Partial<ShopItem> & { id?: string }) => {
    try {
      if (data.id) {
        await updateShopItem.mutateAsync({ id: data.id, ...data });
        toast({ title: 'Item atualizado!' });
      } else {
        await createShopItem.mutateAsync({
          name: data.name || 'Novo Item',
          description: data.description || null,
          type: data.type || 'avatar',
          price: data.price || 100,
          image_url: data.image_url || null,
          asset_download_url: data.asset_download_url || null,
          is_active: data.is_active ?? true,
        });
        toast({ title: 'Item criado!' });
      }
      setEditingShopItem(null);
      setNewShopItemOpen(false);
    } catch (e) {
      toast({
        title: 'Erro ao salvar item',
        description: formatError(e),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteShopItem = async (id: string) => {
    if (!confirm('Excluir este item?')) return;
    try {
      await deleteShopItem.mutateAsync(id);
      toast({ title: 'Item excluído!' });
    } catch (e) {
      toast({
        title: 'Erro ao excluir item',
        description: formatError(e),
        variant: 'destructive',
      });
    }
  };

  const handleSaveAchievement = async (data: Partial<Achievement> & { id?: string }) => {
    try {
      if (data.id) {
        await updateAchievement.mutateAsync({ id: data.id, ...data });
        toast({ title: 'Conquista atualizada!' });
      } else {
        await createAchievement.mutateAsync({
          name: data.name || 'Nova Conquista',
          description: data.description || null,
          icon: data.icon || 'Trophy',
          condition_type: data.condition_type || 'custom',
          condition_value: data.condition_value || null,
          xp_reward: data.xp_reward || 0,
          coin_reward: data.coin_reward || 0,
        });
        toast({ title: 'Conquista criada!' });
      }
      setEditingAchievement(null);
      setNewAchievementOpen(false);
    } catch (e) {
      toast({
        title: 'Erro ao salvar conquista',
        description: formatError(e),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!confirm('Excluir esta conquista?')) return;
    try {
      await deleteAchievement.mutateAsync(id);
      toast({ title: 'Conquista excluída!' });
    } catch (e) {
      toast({
        title: 'Erro ao excluir conquista',
        description: formatError(e),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Logo size="sm" />
            <div className="h-6 w-px bg-white/20" />
            <h1 className="text-lg font-bold text-gradient-blue">Creator Studio</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={activeTab === 'modules' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('modules')}
            className="gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Módulos & Aulas
          </Button>
          <Button
            variant={activeTab === 'quizzes' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('quizzes')}
            className="gap-2"
          >
            <Swords className="w-4 h-4" />
            Boss Battles
          </Button>
          <Button
            variant={activeTab === 'shop' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('shop')}
            className="gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Loja
          </Button>
          <Button
            variant={activeTab === 'achievements' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('achievements')}
            className="gap-2"
          >
            <Trophy className="w-4 h-4" />
            Conquistas
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('users')}
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            Usuários
          </Button>
        </div>

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Gerenciar Módulos</h2>
              <Button variant="neon" onClick={() => setNewModuleOpen(true)} className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Novo Módulo
              </Button>
            </div>

            {/* New Module Form */}
            {newModuleOpen && (
              <ModuleForm
                onSave={handleSaveModule}
                onCancel={() => setNewModuleOpen(false)}
              />
            )}

            {/* Modules List */}
            {modulesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : modules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum módulo criado ainda. Clique em "Novo Módulo" para começar.
              </div>
            ) : (
              modules.map((module) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card overflow-hidden"
                >
                  {/* Module Header */}
                  {editingModule?.id === module.id ? (
                    <ModuleForm
                      module={module}
                      onSave={handleSaveModule}
                      onCancel={() => setEditingModule(null)}
                    />
                  ) : (
                    <div className="p-4 flex items-center gap-4">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${module.color}20` }}
                        >
                          <Gamepad2 className="w-5 h-5" style={{ color: module.color || undefined }} />
                        </div>
                        <div>
                          <h3 className="font-bold">{module.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {getLessonsForModule(module.id).length} aulas
                            {module.is_locked && ' • Bloqueado'}
                          </p>
                        </div>
                        {expandedModules.has(module.id) ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground ml-auto" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
                        )}
                      </button>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingModule(module)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteModule(module.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Lessons */}
                  {expandedModules.has(module.id) && (
                    <div className="border-t border-white/10 bg-black/20 p-4 space-y-2">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Aulas</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setNewLessonModuleId(module.id)}
                          className="gap-1"
                        >
                          <PlusCircle className="w-3 h-3" />
                          Adicionar Aula
                        </Button>
                      </div>

                      {newLessonModuleId === module.id && (
                        <LessonForm
                          moduleId={module.id}
                          onSave={handleSaveLesson}
                          onCancel={() => setNewLessonModuleId(null)}
                        />
                      )}

                      {getLessonsForModule(module.id).map((lesson, index) => (
                        <div key={lesson.id}>
                          {editingLesson?.id === lesson.id ? (
                            <LessonForm
                              lesson={lesson}
                              moduleId={module.id}
                              onSave={handleSaveLesson}
                              onCancel={() => setEditingLesson(null)}
                            />
                          ) : (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                              <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                              <span className="text-sm text-muted-foreground w-8">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              <span className="flex-1 font-medium">{lesson.title}</span>
                              <span className="text-xs text-primary">+{lesson.xp_reward} XP</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setEditingLesson(lesson)}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDeleteLesson(lesson.id)}
                              >
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}

                      {getLessonsForModule(module.id).length === 0 && !newLessonModuleId && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhuma aula neste módulo
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Gerenciar Boss Battles</h2>
            </div>

            {/* Module Selector */}
            <div className="glass-card p-4">
              <label className="text-sm text-muted-foreground mb-2 block">
                Selecione o módulo:
              </label>
              <div className="flex flex-wrap gap-2">
                {modules.map((module) => (
                  <Button
                    key={module.id}
                    variant={selectedQuizModuleId === module.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedQuizModuleId(module.id)}
                  >
                    {module.title}
                  </Button>
                ))}
              </div>
            </div>

            {selectedQuizModuleId && (
              <>
                <div className="flex justify-end">
                  <Button
                    variant="neon"
                    onClick={() => setEditingQuiz({} as Quiz)}
                    className="gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Nova Pergunta
                  </Button>
                </div>

                {editingQuiz && !editingQuiz.id && (
                  <QuizForm
                    onSave={handleSaveQuiz}
                    onCancel={() => setEditingQuiz(null)}
                  />
                )}

                {quizzes.map((quiz, index) => (
                  <div key={quiz.id}>
                    {editingQuiz?.id === quiz.id ? (
                      <QuizForm
                        quiz={quiz}
                        onSave={handleSaveQuiz}
                        onCancel={() => setEditingQuiz(null)}
                      />
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-4"
                      >
                        <div className="flex items-start gap-4">
                          <span className="text-sm font-bold text-primary">
                            Q{index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium mb-2">{quiz.question}</p>
                            <div className="grid grid-cols-2 gap-2">
                              {(quiz.options_json as string[]).map((opt, i) => (
                                <div
                                  key={i}
                                  className={`text-sm p-2 rounded-lg ${
                                    i === quiz.correct_answer
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-white/5 text-muted-foreground'
                                  }`}
                                >
                                  {opt}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingQuiz(quiz)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteQuiz(quiz.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}

                {quizzes.length === 0 && !editingQuiz && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma pergunta criada para este módulo ainda.
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Shop Tab */}
        {activeTab === 'shop' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Gerenciar Loja</h2>
              <Button variant="neon" onClick={() => setNewShopItemOpen(true)} className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Novo Item
              </Button>
            </div>

            {newShopItemOpen && (
              <ShopItemForm
                onSave={handleSaveShopItem}
                onCancel={() => setNewShopItemOpen(false)}
              />
            )}

            {shopLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : shopItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum item na loja ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shopItems.map((item) => (
                  <div key={item.id}>
                    {editingShopItem?.id === item.id ? (
                      <ShopItemForm
                        item={item}
                        onSave={handleSaveShopItem}
                        onCancel={() => setEditingShopItem(null)}
                      />
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`glass-card p-4 ${!item.is_active && 'opacity-50'}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center overflow-hidden">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <Image className="w-8 h-8 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold truncate">{item.name}</h3>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                                {item.type}
                              </span>
                              {!item.is_active && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">
                                  Inativo
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                            <div className="flex items-center gap-1 mt-2 text-amber-400">
                              <Coins className="w-4 h-4" />
                              <span className="font-bold">{item.price}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingShopItem(item)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteShopItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Gerenciar Conquistas</h2>
              <Button variant="neon" onClick={() => setNewAchievementOpen(true)} className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Nova Conquista
              </Button>
            </div>

            {newAchievementOpen && (
              <AchievementForm
                onSave={handleSaveAchievement}
                onCancel={() => setNewAchievementOpen(false)}
              />
            )}

            {achievementsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : achievements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma conquista criada ainda.
              </div>
            ) : (
              <div className="space-y-2">
                {achievements.map((achievement) => (
                  <div key={achievement.id}>
                    {editingAchievement?.id === achievement.id ? (
                      <AchievementForm
                        achievement={achievement}
                        onSave={handleSaveAchievement}
                        onCancel={() => setEditingAchievement(null)}
                      />
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold">{achievement.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{achievement.description}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span className="text-primary">+{achievement.xp_reward} XP</span>
                              <span className="text-amber-400">+{achievement.coin_reward} Coins</span>
                              <span>Tipo: {achievement.condition_type}</span>
                              {achievement.condition_value && <span>Valor: {achievement.condition_value}</span>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingAchievement(achievement)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteAchievement(achievement.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && <UsersTab />}
      </div>
    </div>
  );
}

// Module Form Component
function ModuleForm({
  module,
  onSave,
  onCancel,
}: {
  module?: Module;
  onSave: (data: Partial<Module> & { id?: string }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(module?.title || '');
  const [description, setDescription] = useState(module?.description || '');
  const [color, setColor] = useState(module?.color || '#0EA5E9');
  const [isLocked, setIsLocked] = useState(module?.is_locked ?? true);

  return (
    <div className="p-4 space-y-4 bg-black/20 border-b border-white/10">
      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Título do módulo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex gap-2">
          <Input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-14 p-1 h-10"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!isLocked}
              onChange={(e) => setIsLocked(!e.target.checked)}
              className="rounded"
            />
            Desbloqueado
          </label>
        </div>
      </div>
      <Textarea
        placeholder="Descrição do módulo (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          <X className="w-4 h-4 mr-1" /> Cancelar
        </Button>
        <Button
          onClick={() =>
            onSave({ id: module?.id, title, description, color, is_locked: isLocked })
          }
        >
          <Save className="w-4 h-4 mr-1" /> Salvar
        </Button>
      </div>
    </div>
  );
}

// Lesson Form Component
function LessonForm({
  lesson,
  moduleId,
  onSave,
  onCancel,
}: {
  lesson?: Lesson;
  moduleId: string;
  onSave: (data: Partial<Lesson> & { id?: string; module_id: string }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(lesson?.title || '');
  const [videoUrl, setVideoUrl] = useState(lesson?.video_url || '');
  const [content, setContent] = useState(lesson?.content_text || '');
  const [xpReward, setXpReward] = useState(lesson?.xp_reward || 100);

  return (
    <div className="p-4 space-y-4 bg-black/30 rounded-lg border border-white/10">
      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Título da aula"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex gap-2">
          <Input
            placeholder="URL do vídeo (YouTube/Vimeo)"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            value={xpReward}
            onChange={(e) => setXpReward(Number(e.target.value))}
            className="w-24"
            placeholder="XP"
          />
        </div>
      </div>
      <Textarea
        placeholder="Conteúdo da aula (Markdown suportado)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          <X className="w-4 h-4 mr-1" /> Cancelar
        </Button>
        <Button
          onClick={() =>
            onSave({
              id: lesson?.id,
              module_id: moduleId,
              title,
              video_url: videoUrl || null,
              content_text: content || null,
              xp_reward: xpReward,
            })
          }
        >
          <Save className="w-4 h-4 mr-1" /> Salvar
        </Button>
      </div>
    </div>
  );
}

// Quiz Form Component
function QuizForm({
  quiz,
  onSave,
  onCancel,
}: {
  quiz?: Quiz;
  onSave: (data: Partial<Quiz> & { id?: string }) => void;
  onCancel: () => void;
}) {
  const [question, setQuestion] = useState(quiz?.question || '');
  const [options, setOptions] = useState<string[]>(
    (quiz?.options_json as string[]) || ['', '', '', '']
  );
  const [correctAnswer, setCorrectAnswer] = useState(quiz?.correct_answer || 0);
  const [explanation, setExplanation] = useState(quiz?.explanation || '');
  const [imageUrl, setImageUrl] = useState(quiz?.image_url || '');

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <div className="glass-card p-4 space-y-4">
      <Input
        placeholder="Pergunta"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <Input
        placeholder="URL da imagem (opcional, para perguntas visuais)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4">
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="radio"
              name="correct"
              checked={correctAnswer === i}
              onChange={() => setCorrectAnswer(i)}
              className="mt-3"
            />
            <Input
              placeholder={`Opção ${i + 1}`}
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              className={correctAnswer === i ? 'border-emerald-500' : ''}
            />
          </div>
        ))}
      </div>
      <Textarea
        placeholder="Explicação (mostrada quando o aluno erra)"
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        rows={2}
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          <X className="w-4 h-4 mr-1" /> Cancelar
        </Button>
        <Button
          onClick={() =>
            onSave({
              id: quiz?.id,
              question,
              options_json: options,
              correct_answer: correctAnswer,
              explanation: explanation || null,
              image_url: imageUrl || null,
            })
          }
        >
          <Save className="w-4 h-4 mr-1" /> Salvar
        </Button>
      </div>
    </div>
  );
}

// Shop Item Form Component
function ShopItemForm({
  item,
  onSave,
  onCancel,
}: {
  item?: ShopItem;
  onSave: (data: Partial<ShopItem> & { id?: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState(item?.description || '');
  const [type, setType] = useState<'avatar' | 'frame' | 'asset_pack' | 'theme'>(item?.type || 'avatar');
  const [price, setPrice] = useState(item?.price || 100);
  const [imageUrl, setImageUrl] = useState(item?.image_url || '');
  const [assetUrl, setAssetUrl] = useState(item?.asset_download_url || '');
  const [isActive, setIsActive] = useState(item?.is_active ?? true);

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Nome do item"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="avatar">Avatar</option>
          <option value="frame">Moldura</option>
          <option value="asset_pack">Pack de Assets</option>
          <option value="theme">Tema</option>
        </select>
      </div>
      <Textarea
        placeholder="Descrição do item"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          placeholder="Preço (moedas)"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded"
          />
          Ativo na loja
        </label>
      </div>
      <Input
        placeholder="URL da imagem"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <Input
        placeholder="URL para download (opcional, para asset packs)"
        value={assetUrl}
        onChange={(e) => setAssetUrl(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          <X className="w-4 h-4 mr-1" /> Cancelar
        </Button>
        <Button
          onClick={() =>
            onSave({
              id: item?.id,
              name,
              description: description || null,
              type,
              price,
              image_url: imageUrl || null,
              asset_download_url: assetUrl || null,
              is_active: isActive,
            })
          }
        >
          <Save className="w-4 h-4 mr-1" /> Salvar
        </Button>
      </div>
    </div>
  );
}

// Achievement Form Component
function AchievementForm({
  achievement,
  onSave,
  onCancel,
}: {
  achievement?: Achievement;
  onSave: (data: Partial<Achievement> & { id?: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(achievement?.name || '');
  const [description, setDescription] = useState(achievement?.description || '');
  const [icon, setIcon] = useState(achievement?.icon || 'Trophy');
  const [conditionType, setConditionType] = useState(achievement?.condition_type || 'custom');
  const [conditionValue, setConditionValue] = useState(achievement?.condition_value || '');
  const [xpReward, setXpReward] = useState(achievement?.xp_reward || 0);
  const [coinReward, setCoinReward] = useState(achievement?.coin_reward || 0);

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Nome da conquista"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Ícone (ex: Trophy, Star)"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
        />
      </div>
      <Textarea
        placeholder="Descrição da conquista"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />
      <div className="grid grid-cols-2 gap-4">
        <select
          value={conditionType}
          onChange={(e) => setConditionType(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="lessons_completed">Aulas Completadas</option>
          <option value="boss_defeated">Boss Derrotado</option>
          <option value="perfect_score">Pontuação Perfeita</option>
          <option value="custom">Personalizado</option>
        </select>
        <Input
          placeholder="Valor da condição (ex: 5)"
          value={conditionValue}
          onChange={(e) => setConditionValue(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          placeholder="Recompensa XP"
          value={xpReward}
          onChange={(e) => setXpReward(Number(e.target.value))}
        />
        <Input
          type="number"
          placeholder="Recompensa Moedas"
          value={coinReward}
          onChange={(e) => setCoinReward(Number(e.target.value))}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          <X className="w-4 h-4 mr-1" /> Cancelar
        </Button>
        <Button
          onClick={() =>
            onSave({
              id: achievement?.id,
              name,
              description: description || null,
              icon,
              condition_type: conditionType,
              condition_value: conditionValue || null,
              xp_reward: xpReward,
              coin_reward: coinReward,
            })
          }
        >
          <Save className="w-4 h-4 mr-1" /> Salvar
        </Button>
      </div>
    </div>
  );
}
