"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { deleteLessonAction, reorderLessonAction } from "@/app/actions/teacher";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUp, ArrowDown, Loader2, AlertCircle, Edit2 } from "lucide-react";
import { EditLessonModal } from "./EditLessonModal";
import type { CourseOption } from "./LessonManagementForms";

interface LessonActionsProps {
  lesson: {
    id: string;
    courseId: string;
    title: string;
    description?: string;
    duration?: number | null;
  };
  bunnyVideoId?: string | null;
  isFirst: boolean;
  isLast: boolean;
  courses: CourseOption[];
}

export function LessonActions({ lesson, bunnyVideoId, isFirst, isLast, courses }: LessonActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteLessonAction(lesson.id, bunnyVideoId);
    if (!res.success) {
      alert(res.error || "Silme işlemi başarısız.");
      setIsDeleting(false);
    }
  };

  const handleReorder = async (direction: "UP" | "DOWN") => {
    setIsReordering(true);
    const res = await reorderLessonAction(lesson.id, direction);
    if (!res.success) {
      alert(res.error || "Sıralama değiştirilemedi.");
    }
    setIsReordering(false);
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg">
        <AlertCircle className="w-3 h-3 text-red-400 hidden sm:block" />
        <span className="text-[10px] sm:text-xs text-red-400 font-medium">Emin misin?</span>
        <div className="flex items-center gap-1 ml-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 px-1.5 text-[10px] text-slate-400 hover:text-white"
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
          >
            İptal
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="h-5 px-1.5 text-[10px] font-bold"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Sil"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 text-slate-400 hover:text-white hover:bg-white/10 rounded-md"
          onClick={() => handleReorder("UP")}
          disabled={isFirst || isReordering}
          title="Yukarı Taşı"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 text-slate-400 hover:text-white hover:bg-white/10 rounded-md"
          onClick={() => handleReorder("DOWN")}
          disabled={isLast || isReordering}
          title="Aşağı Taşı"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </Button>
        
        <div className="w-px h-4 bg-white/10 mx-1" />
        
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 text-edu-cyan hover:text-edu-cyan hover:bg-edu-cyan/10 rounded-md"
          onClick={() => setIsEditing(true)}
          title="Dersi Düzenle"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-md"
          onClick={() => setShowConfirm(true)}
          title="Dersi Sil"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      <AnimatePresence>
        {isEditing && (
          <EditLessonModal 
            lesson={{
              ...lesson,
              durationHours: lesson.duration ? Math.floor(lesson.duration / 3600) : undefined,
              durationMinutes: lesson.duration ? Math.floor((lesson.duration % 3600) / 60) : undefined
            }}
            courses={courses}
            onClose={() => setIsEditing(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
