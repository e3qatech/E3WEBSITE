"use client"

import React, { ReactNode } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Plus, Trash2 } from "lucide-react"

interface RepeaterFieldProps<T extends { id: string }> {
  items: T[]
  setItems: (items: T[]) => void
  onAdd: () => void
  renderItem: (item: T, index: number, updateItem: (updates: Partial<T>) => void) => ReactNode
  addLabel?: string
}

function SortableItem<T extends { id: string }>({ 
  item, 
  index, 
  renderItem, 
  updateItem, 
  onRemove 
}: { 
  item: T
  index: number
  renderItem: (item: T, index: number, updateItem: (updates: Partial<T>) => void) => ReactNode
  updateItem: (updates: Partial<T>) => void
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: "relative" as const,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group flex items-start gap-4 p-4 border rounded-xl mb-4 bg-[var(--surface-default)] transition-colors ${isDragging ? "border-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/10" : "border-[var(--border-default)]"}`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="mt-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical size={20} />
      </div>
      
      <div className="flex-1">
        {renderItem(item, index, updateItem)}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="mt-2 text-[var(--text-tertiary)] hover:text-[var(--color-error)] transition-colors p-2 rounded hover:bg-[var(--color-error)]/10"
        title="Remove item"
      >
        <Trash2 size={20} />
      </button>
    </div>
  )
}

export function RepeaterField<T extends { id: string }>({ 
  items, 
  setItems, 
  onAdd, 
  renderItem,
  addLabel = "Add Item"
}: RepeaterFieldProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over.id)
      setItems(arrayMove(items, oldIndex, newIndex))
    }
  }

  const updateItem = (id: string, updates: Partial<T>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item))
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  return (
    <div className="w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item, index) => (
            <SortableItem 
              key={item.id} 
              item={item} 
              index={index}
              renderItem={renderItem}
              updateItem={(updates) => updateItem(item.id, updates)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={onAdd}
        className="w-full py-3 mt-2 border-2 border-dashed border-[var(--border-default)] hover:border-[var(--color-primary)] rounded-xl flex items-center justify-center gap-2 text-[var(--text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all font-bold"
      >
        <Plus size={20} />
        {addLabel}
      </button>
    </div>
  )
}
