'use client';

import { useState, useEffect } from 'react';
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
import visaChecklists from '../data/visaChecklists';

const VISA_TYPES = {
  partner: 'Partner Visa',
  temporaryWork: '482 Temporary Work Visa',
  protection: 'Protection Visa',
  employerSponsored: 'Permanent Employer Sponsored Visa',
};

function SortableItem({ id, item, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-white p-3 rounded border border-gray-200 group hover:border-gray-300"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onEdit(e.target.textContent)}
        className="flex-1 outline-none focus:bg-gray-50 px-2 py-1 rounded"
      >
        {item}
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity flex-shrink-0"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

export default function Home() {
  const [selectedVisa, setSelectedVisa] = useState('partner');
  const [useTemplate, setUseTemplate] = useState('default');
  const [checklist, setChecklist] = useState({});
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [hasSavedTemplate, setHasSavedTemplate] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadChecklist();
  }, [selectedVisa, useTemplate]);

  const loadChecklist = () => {
    if (useTemplate === 'saved') {
      const saved = localStorage.getItem(`template_${selectedVisa}`);
      if (saved) {
        setChecklist(JSON.parse(saved));
        return;
      }
    }
    
    const defaultChecklist = visaChecklists[selectedVisa];
    const formatted = {};
    Object.entries(defaultChecklist).forEach(([category, items]) => {
      formatted[category] = items.map((item, index) => ({
        id: `${category}-${index}-${Date.now()}`,
        text: item,
      }));
    });
    setChecklist(formatted);
  };

  const checkForSavedTemplate = (visaType) => {
    const saved = localStorage.getItem(`template_${visaType}`);
    setHasSavedTemplate(!!saved);
  };

  useEffect(() => {
    checkForSavedTemplate(selectedVisa);
  }, [selectedVisa]);

  const handleVisaChange = (e) => {
    setSelectedVisa(e.target.value);
    setUseTemplate('default');
  };

  const toggleCategory = (category) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const updateCategoryName = (oldName, newName) => {
    if (oldName === newName || !newName.trim()) return;
    
    const newChecklist = {};
    Object.entries(checklist).forEach(([key, value]) => {
      if (key === oldName) {
        newChecklist[newName] = value;
      } else {
        newChecklist[key] = value;
      }
    });
    setChecklist(newChecklist);
  };

  const deleteCategory = (category) => {
    const newChecklist = { ...checklist };
    delete newChecklist[category];
    setChecklist(newChecklist);
  };

  const addCategory = () => {
    const newCategoryName = `New Category ${Object.keys(checklist).length + 1}`;
    setChecklist({
      ...checklist,
      [newCategoryName]: [],
    });
  };

  const addItem = (category) => {
    const newItem = {
      id: `${category}-${Date.now()}`,
      text: 'New Item',
    };
    setChecklist({
      ...checklist,
      [category]: [...(checklist[category] || []), newItem],
    });
  };

  const updateItem = (category, itemId, newText) => {
    if (!newText.trim()) return;
    
    setChecklist({
      ...checklist,
      [category]: checklist[category].map((item) =>
        item.id === itemId ? { ...item, text: newText } : item
      ),
    });
  };

  const deleteItem = (category, itemId) => {
    setChecklist({
      ...checklist,
      [category]: checklist[category].filter((item) => item.id !== itemId),
    });
  };

  const handleDragEnd = (event, category) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const items = checklist[category];
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      setChecklist({
        ...checklist,
        [category]: arrayMove(items, oldIndex, newIndex),
      });
    }
  };

  const saveAsTemplate = () => {
    localStorage.setItem(`template_${selectedVisa}`, JSON.stringify(checklist));
    setHasSavedTemplate(true);
    alert('Template saved successfully!');
  };

  const saveChecklist = () => {
    localStorage.setItem(`checklist_${selectedVisa}`, JSON.stringify(checklist));
    alert('Checklist saved!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Visa Checklist Builder</h1>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Visa Type
              </label>
              <select
                value={selectedVisa}
                onChange={handleVisaChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-visa-green focus:border-transparent outline-none"
              >
                {Object.entries(VISA_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {hasSavedTemplate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Source
                </label>
                <select
                  value={useTemplate}
                  onChange={(e) => setUseTemplate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-visa-green focus:border-transparent outline-none"
                >
                  <option value="default">Default Template</option>
                  <option value="saved">Saved Template</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={saveAsTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-visa-green text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save as Template
            </button>
            <button
              onClick={saveChecklist}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Checklist
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(checklist).map(([category, items]) => (
            <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-100 p-4 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        collapsedCategories[category] ? '-rotate-90' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateCategoryName(category, e.target.textContent)}
                    className="text-lg font-semibold text-gray-800 outline-none focus:bg-white px-2 py-1 rounded flex-1"
                  >
                    {category}
                  </div>
                </div>
                <button
                  onClick={() => deleteCategory(category)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Delete Category"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {!collapsedCategories[category] && (
                <div className="p-4">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, category)}
                  >
                    <SortableContext
                      items={items.map((item) => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2 mb-4">
                        {items.map((item) => (
                          <SortableItem
                            key={item.id}
                            id={item.id}
                            item={item.text}
                            onEdit={(newText) => updateItem(category, item.id, newText)}
                            onDelete={() => deleteItem(category, item.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  <button
                    onClick={() => addItem(category)}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-visa-green hover:text-visa-green transition-colors"
                  >
                    + Add Item
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addCategory}
            className="w-full px-6 py-3 bg-visa-green text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            + Add Category
          </button>
        </div>
      </div>
    </div>
  );
}
