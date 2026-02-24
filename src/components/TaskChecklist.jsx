import React, { useState, useEffect, useCallback } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    reorderChecklist,
    bulkChecklistAction
} from '../services/api';
import './TaskChecklist.css';

const SortableItem = ({ id, item, onToggle, onDelete, onEdit }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(item.text);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 1
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (editText !== item.text) {
            onEdit(item._id, editText);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleBlur();
        if (e.key === 'Escape') {
            setIsEditing(false);
            setEditText(item.text);
        }
    };

    return (
        <div ref={setNodeRef} style={style} className={`checklist-item ${item.completed ? 'completed' : ''}`}>
            <div className="drag-handle" {...attributes} {...listeners}>
                ⠿
            </div>

            <input
                type="checkbox"
                checked={item.completed}
                onChange={() => onToggle(item._id, !item.completed)}
                className="item-checkbox"
                id={`checklist-item-${id}`}
                name="checklistItem"
                aria-label={`Mark ${item.text} as ${item.completed ? 'incomplete' : 'complete'}`}
            />

            {isEditing ? (
                <input
                    type="text"
                    className="item-edit-input"
                    id={`edit-checklist-item-${id}`}
                    name="editChecklistItem"
                    aria-label="Edit checklist item"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
            ) : (
                <span className="item-text" onClick={() => setIsEditing(true)}>
                    {item.text}
                </span>
            )}

            <button className="item-delete-btn" onClick={() => onDelete(item._id)}>
                &times;
            </button>
        </div>
    );
};

const TaskChecklist = ({ taskId, initialItems = [], onProgressChange }) => {
    const [items, setItems] = useState(initialItems);
    const [newItemText, setNewItemText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const totalItems = items.length;
    const completedItems = items.filter(item => item.completed).length;
    const progress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

    useEffect(() => {
        if (onProgressChange) onProgressChange(progress);
    }, [progress, onProgressChange]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItemText.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const response = await addChecklistItem(taskId, { text: newItemText, order: items.length });
            setItems(response.checklist);
            setNewItemText('');
        } catch (err) {
            console.error('Failed to add checklist item:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleItem = async (itemId, completed) => {
        try {
            const response = await updateChecklistItem(taskId, itemId, { completed });
            setItems(response.checklist);
        } catch (err) {
            console.error('Failed to toggle item:', err);
        }
    };

    const handleEditItem = async (itemId, text) => {
        if (!text.trim()) return;
        try {
            const response = await updateChecklistItem(taskId, itemId, { text });
            setItems(response.checklist);
        } catch (err) {
            console.error('Failed to edit item:', err);
        }
    };

    const handleDeleteItem = async (itemId) => {
        try {
            const response = await deleteChecklistItem(taskId, itemId);
            setItems(response.checklist);
        } catch (err) {
            console.error('Failed to delete item:', err);
        }
    };

    const handleBulkAction = async (action) => {
        if (action === 'delete_completed' && !window.confirm('Delete all completed items?')) return;
        try {
            const response = await bulkChecklistAction(taskId, action);
            setItems(response.checklist);
        } catch (err) {
            console.error(`Failed to perform bulk action ${action}:`, err);
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = items.findIndex(i => i._id === active.id);
            const newIndex = items.findIndex(i => i._id === over.id);

            const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
                ...item,
                order: index
            }));

            setItems(newItems);

            try {
                const response = await reorderChecklist(taskId, newItems);
                setItems(response.checklist);
            } catch (err) {
                console.error('Failed to save reorder:', err);
            }
        }
    };

    return (
        <div className="task-checklist">
            <div className="checklist-header">
                <h5>Checklist</h5>
                <span className="progress-percentage">{progress}%</span>
            </div>

            <div className="checklist-progress-container">
                <div className="checklist-progress-bar" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="checklist-items-container">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={items.map(i => i._id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {items.map(item => (
                            <SortableItem
                                key={item._id}
                                id={item._id}
                                item={item}
                                onToggle={handleToggleItem}
                                onDelete={handleDeleteItem}
                                onEdit={handleEditItem}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            {items.length > 0 && (
                <div className="bulk-actions-bar">
                    <button onClick={() => handleBulkAction('complete_all')} title="Complete all">✓ All</button>
                    <button onClick={() => handleBulkAction('uncomplete_all')} title="Uncomplete all">↺ None</button>
                    <button onClick={() => handleBulkAction('delete_completed')} title="Delete completed" className="delete-bulk">🗑 Completed</button>
                </div>
            )}

            <form className="add-checklist-item-form" onSubmit={handleAddItem}>
                <input
                    type="text"
                    id="new-checklist-item"
                    name="newChecklistItem"
                    aria-label="Add a checklist item"
                    placeholder="Add an item..."
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    disabled={isSubmitting}
                />
                <button type="submit" disabled={isSubmitting || !newItemText.trim()}>
                    +
                </button>
            </form>
        </div>
    );
};

export default TaskChecklist;
