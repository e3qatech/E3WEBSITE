"use client"

import React from "react"
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface RepeaterItemProps {
  id: string
  children: React.ReactNode
  onRemove: () => void
}

function SortableItem({ id, children, onRemove }: RepeaterItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl p-4 flex gap-4 ${
        isDragging ? 'opacity-50 shadow-xl scale-[1.02] z-50' : ''
      }`}
    >
      <button 
        {...attributes} 
        {...listeners}
        className="mt-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-grab active:cursor-grabbing h-fit shrink-0"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      
      <div className="flex-1 min-w-0">
        {children}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="mt-2 text-[var(--color-error)]/50 hover:text-[var(--color-error)] h-fit shrink-0 transition-colors p-2 hover:bg-[var(--surface-default)] rounded-sg"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  )
}

interface RepeaterProps<T extends { id: string }> {
  items: T[]
  onReorder: (newItems: T[]) => void
  onAdd: () => void
  onRemove: (id: string) => void
  renderItem: (item: T, index: number) => React.ReactNode
  addLabel?: string
}

export function Repeater<T extends { id: string }>({ 
  items, 
  onReorder, 
  onAdd, 
  onRemove, 
  renderItem,
  addLabel = "Add Item"
}: RepeaterProps<T>) {

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(i => i.id === active.id)
      const newIndex = items.findIndex(i => i.id === over.id)
      onReorder(arrayMove(items, oldIndex, newIndex))
    }
  }

  return (
    <div className="space-y-4">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={items.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {items.map((item, index) => (
              <SortableItem key={item.id} id={item.id} onRemove={() => onRemove(item.id)}>
                {renderItem(item, index)}
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button type="button" variant="outline" onClick={onAdd} className="w-full gap-2 border-dashed">
        <Plus className="w-4 h-4" />
        {addLabel}
      </Button>
    </div>
  )
}
