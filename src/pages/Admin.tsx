import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusCircle, Edit2, Trash2, ChevronDown, ChevronRight, 
  BookOpen, Gamepad2, Swords, ArrowLeft, Save, X, GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Logo } from '@/components/Logo';
import { useModules, useCreateModule, useUpdateModule, useDeleteModule } from '@/hooks/useModules';
import { useLessons, useCreateLesson, useUpdateLesson, useDeleteLesson } from '@/hooks/useLessons';
import { useQuizzes, useCreateQuiz, useUpdateQuiz, useDeleteQuiz } from '@/hooks/useQuizzes';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { Module } from '@/hooks/useModules';
import type { Lesson } from '@/hooks/useLessons';
import type { Quiz } from '@/hooks/useQuizzes';

type Tab = 'modules' | 'quizzes';

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('modules');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [newModuleOpen, setNewModuleOpen] = useState(false);
  const [newLessonModuleId, setNewLessonModuleId] = useState<string | null>(null);
  const [selectedQuizModuleId, setSelectedQuizModuleId] = useState<string | null>(null);

  const { data: modules = [], isLoading: modulesLoading } = useModules();
  const { data: allLessons = [] } = useLessons();
  const { data: quizzes = [] } = useQuizzes(selectedQuizModuleId || undefined);
  
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();
  const createQuiz = useCreateQuiz();
  const updateQuiz = useUpdateQuiz();
  const deleteQuiz = useDeleteQuiz();

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
    } catch {
      toast({ title: 'Erro ao salvar módulo', variant: 'destructive' });
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Tem certeza? Isso excluirá todas as aulas deste módulo.')) return;
    try {
      await deleteModule.mutateAsync(id);
      toast({ title: 'Módulo excluído!' });
    } catch {
      toast({ title: 'Erro ao excluir módulo', variant: 'destructive' });
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
    } catch {
      toast({ title: 'Erro ao salvar aula', variant: 'destructive' });
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Excluir esta aula?')) return;
    try {
      await deleteLesson.mutateAsync(id);
      toast({ title: 'Aula excluída!' });
    } catch {
      toast({ title: 'Erro ao excluir aula', variant: 'destructive' });
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
    } catch {
      toast({ title: 'Erro ao salvar pergunta', variant: 'destructive' });
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Excluir esta pergunta?')) return;
    try {
      await deleteQuiz.mutateAsync(id);
      toast({ title: 'Pergunta excluída!' });
    } catch {
      toast({ title: 'Erro ao excluir pergunta', variant: 'destructive' });
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
        <div className="flex gap-2 mb-8">
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
