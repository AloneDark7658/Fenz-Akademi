"use client";

import { useState } from "react";
import { deleteCourseAction, toggleCoursePublishAction } from "@/app/actions/teacher";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CourseActionsProps {
  courseId: string;
  isPublished: boolean;
}

export function CourseActions({ courseId, isPublished }: CourseActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleTogglePublish = async () => {
    setIsToggling(true);
    const res = await toggleCoursePublishAction(courseId);
    if (!res.success) {
      alert(res.error || "İşlem başarısız.");
    }
    setIsToggling(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteCourseAction(courseId);
    if (!res.success) {
      alert(res.error || "Silme işlemi başarısız.");
      setIsDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
        <AlertCircle className="w-4 h-4 text-red-400" />
        <span className="text-xs text-red-400 font-medium">Tüm dersler silinecek!</span>
        <div className="flex items-center gap-1 ml-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs text-slate-400 hover:text-white"
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
          >
            İptal
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="h-6 px-2 text-xs font-bold"
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-white/10 text-white rounded-xl">
        <DropdownMenuItem 
          className="focus:bg-white/10 focus:text-white cursor-pointer rounded-lg mb-1"
          onClick={handleTogglePublish}
          disabled={isToggling}
        >
          {isPublished ? (
            <><EyeOff className="w-4 h-4 mr-2" /> Yayından Kaldır</>
          ) : (
            <><Eye className="w-4 h-4 mr-2" /> Yayına Al</>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="text-red-400 focus:bg-red-500/20 focus:text-red-300 cursor-pointer rounded-lg"
          onClick={(e) => {
            e.preventDefault();
            setShowConfirm(true);
          }}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Üniteyi Sil
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
