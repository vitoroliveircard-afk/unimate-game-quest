import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Lock, ChevronLeft, ChevronRight, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Lesson } from '@/hooks/useLessons';
import type { UserProgress } from '@/hooks/useUserProgress';

interface LessonSidebarProps {
  lessons: Lesson[];
  currentLessonId: string;
  userProgress: UserProgress[];
  moduleTitle: string;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  onSelectLesson: (lessonId: string) => void;
  onBossFight?: () => void;
}

export function LessonSidebar({
  lessons,
  currentLessonId,
  userProgress,
  moduleTitle,
  collapsed,
  onCollapse,
  onSelectLesson,
  onBossFight,
}: LessonSidebarProps) {
  const isLessonCompleted = (lessonId: string) =>
    userProgress.some((p) => p.lesson_id === lessonId && p.is_completed);

  const getCompletedCount = () =>
    lessons.filter((l) => isLessonCompleted(l.id)).length;

  const allLessonsCompleted = getCompletedCount() === lessons.length;

  return (
    <motion.aside
      className={cn(
        'h-full border-r border-white/10 bg-sidebar-background flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-72'
      )}
      initial={false}
      animate={{ width: collapsed ? 64 : 288 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        {!collapsed && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Módulo</p>
            <h2 className="font-bold text-sm truncate">{moduleTitle}</h2>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onCollapse(!collapsed)}
          className="shrink-0"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Lessons List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {lessons.map((lesson, index) => {
          const isCompleted = isLessonCompleted(lesson.id);
          const isCurrent = lesson.id === currentLessonId;
          const isLocked = index > 0 && !isLessonCompleted(lessons[index - 1].id) && !isCompleted;

          return (
            <button
              key={lesson.id}
              onClick={() => !isLocked && onSelectLesson(lesson.id)}
              disabled={isLocked}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left',
                isCurrent && 'bg-primary/20 border border-primary/40',
                !isCurrent && !isLocked && 'hover:bg-white/5',
                isLocked && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  isCompleted && 'bg-emerald-500/20 text-emerald-400',
                  isCurrent && !isCompleted && 'bg-primary/20 text-primary',
                  !isCurrent && !isCompleted && !isLocked && 'bg-muted text-muted-foreground',
                  isLocked && 'bg-muted/50 text-muted-foreground/50'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isLocked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Aula {index + 1}</p>
                  <p className="font-medium text-sm truncate">{lesson.title}</p>
                </div>
              )}
            </button>
          );
        })}

        {/* Boss Fight Button */}
        {onBossFight && (
          <button
            onClick={onBossFight}
            disabled={!allLessonsCompleted}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left mt-4',
              allLessonsCompleted
                ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/40 hover:border-orange-500/60'
                : 'opacity-50 cursor-not-allowed bg-muted/30'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                allLessonsCompleted
                  ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Swords className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs text-orange-400">BOSS FIGHT</p>
                <p className="font-bold text-sm">Enfrentar o Chefe</p>
              </div>
            )}
          </button>
        )}
      </div>

      {/* Progress Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-white/10">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Progresso</span>
            <span>{getCompletedCount()}/{lessons.length}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${(getCompletedCount() / lessons.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </motion.aside>
  );
}
