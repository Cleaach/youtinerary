import { useDraggable } from "@dnd-kit/core";
import { Task } from "../Pages/types";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

type TaskCardProps = {
  task: Task;
  isOverlay?: boolean;
};

export function TaskCard({ task, isOverlay = false }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: !isDragging ? "transform 0.2s ease" : "none",
    width: "100%",
    contain: "content",
    opacity: isDragging && !isOverlay ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="cursor-grab rounded-lg bg-neutral-700 p-4 shadow-sm hover:shadow-md"
      style={style}
    >
      <h3 className="font-medium text-neutral-100">{task.title}</h3>
      <p className="mt-2 text-sm text-neutral-400">{task.description}</p>
      <p className="mt-1 text-xs text-blue-400">📍 {task.location}</p>
    </div>
  );
}
