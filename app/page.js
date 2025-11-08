'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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

// Map Zoho Visa_Type values to our internal visa type keys
const mapZohoVisaType = (zohoVisaType) => {
  if (!zohoVisaType) return null;
  
  const typeLower = zohoVisaType.toLowerCase();
  
  if (typeLower.includes('partner')) return 'partner';
  if (typeLower.includes('482') || typeLower.includes('temporary work')) return 'temporaryWork';
  if (typeLower.includes('protection')) return 'protection';
  if (typeLower.includes('employer') || typeLower.includes('sponsored')) return 'employerSponsored';
  
  return null;
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

function HomeContent() {
  const searchParams = useSearchParams();
  const [selectedVisa, setSelectedVisa] = useState('partner');
  const [useTemplate, setUseTemplate] = useState('default');
  const [checklist, setChecklist] = useState({});
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [hasSavedTemplate, setHasSavedTemplate] = useState(false);
  const [dealData, setDealData] = useState(null);
  const [loadingDeal, setLoadingDeal] = useState(false);
  const [dealError, setDealError] = useState(null);
  const [savedChecklistJson, setSavedChecklistJson] = useState(null);
  const [zohoSaveStatus, setZohoSaveStatus] = useState(null); // 'saving', 'success', 'error'
  const [zohoSaveError, setZohoSaveError] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch deal data from Zoho CRM when deal_id is in URL
  useEffect(() => {
    const dealId = searchParams.get('deal_id');
    
    if (dealId) {
      fetchDealData(dealId);
    }
  }, [searchParams]);

  const fetchDealData = async (dealId) => {
    setLoadingDeal(true);
    setDealError(null);
    
    try {
      const response = await fetch(`/api/zoho/deal?deal_id=${dealId}`);
      const data = await response.json();
      
      if (data.success && data.deal) {
        setDealData(data.deal);
        
        // Try to map Zoho Visa_Type to our visa type
        const mappedVisaType = mapZohoVisaType(data.deal.Visa_Type);
        if (mappedVisaType) {
          setSelectedVisa(mappedVisaType);
        }
      } else {
        setDealError(data.error || 'Failed to fetch deal data');
      }
    } catch (error) {
      console.error('Error fetching deal:', error);
      setDealError('Failed to connect to Zoho CRM. Please check your configuration.');
    } finally {
      setLoadingDeal(false);
    }
  };

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

    if (!over || active.id === over.id) {
      return;
    }

    const items = checklist[category];
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    setChecklist({
      ...checklist,
      [category]: arrayMove(items, oldIndex, newIndex),
    });
  };

  const saveAsTemplate = () => {
    localStorage.setItem(`template_${selectedVisa}`, JSON.stringify(checklist));
    setHasSavedTemplate(true);
    alert('Template saved successfully!');
  };

  const saveChecklist = async () => {
    // Format the checklist to preserve order and structure
    const formattedChecklist = {
      visaType: selectedVisa,
      savedAt: new Date().toISOString(),
      categories: Object.entries(checklist).map(([categoryName, items]) => ({
        name: categoryName,
        items: items.map((item, index) => ({
          id: item.id,
          text: item.text,
          order: index + 1, // Explicit order indicator
        })),
      })),
      // Also include raw structure for easy access
      raw: checklist,
    };
    
    const jsonString = JSON.stringify(formattedChecklist, null, 2);
    
    // Always save to localStorage
    localStorage.setItem(`checklist_${selectedVisa}`, JSON.stringify(checklist));
    
    // Show the JSON at the top
    setSavedChecklistJson(jsonString);
    
    // Scroll to top to show the JSON
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Save to Zoho if deal exists
    if (dealData && dealData.id) {
      setZohoSaveStatus('saving');
      setZohoSaveError(null);
      
      try {
        const response = await fetch('/api/zoho/deal', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deal_id: dealData.id,
            documents_json: jsonString,
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setZohoSaveStatus('success');
          setZohoSaveError(null);
        } else {
          setZohoSaveStatus('error');
          setZohoSaveError(data.error || 'Failed to save to Zoho CRM');
        }
      } catch (error) {
        console.error('Error saving to Zoho:', error);
        setZohoSaveStatus('error');
        setZohoSaveError(error.message || 'Failed to connect to Zoho CRM');
      }
    } else {
      // No deal data, clear Zoho save status
      setZohoSaveStatus(null);
      setZohoSaveError(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('JSON copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Saved Checklist JSON Display */}
        {savedChecklistJson && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-lg font-semibold text-indigo-800">Saved Checklist JSON (with Order/Sequence)</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(savedChecklistJson)}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy JSON
                </button>
                <button
                  onClick={() => setSavedChecklistJson(null)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <pre className="bg-white border border-indigo-100 rounded p-4 overflow-x-auto text-sm text-gray-800 max-h-96 overflow-y-auto">
              <code>{savedChecklistJson}</code>
            </pre>
            <div className="mt-3 space-y-2">
              {/* Zoho Save Status Indicators */}
              {dealData && dealData.id && (
                <>
                  {zohoSaveStatus === 'saving' && (
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving to Zoho CRM...</span>
                    </div>
                  )}
                  
                  {zohoSaveStatus === 'success' && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>✓ Successfully saved to Zoho Deal (documents_json field)</span>
                    </div>
                  )}
                  
                  {zohoSaveStatus === 'error' && (
                    <div className="flex items-start gap-2 text-xs text-red-600">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <span className="font-medium">Failed to save to Zoho CRM:</span>
                        <span className="ml-1">{zohoSaveError || 'Unknown error'}</span>
                        <span className="block mt-1 text-gray-600">Checklist was saved to localStorage only.</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Visa Checklist Builder</h1>
          
          {/* Deal Information Display */}
          {loadingDeal && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading deal information from Zoho CRM...</span>
              </div>
            </div>
          )}
          
          {dealError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{dealError}</span>
              </div>
            </div>
          )}
          
          {dealData && !loadingDeal && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800 mb-1">Connected to Zoho Deal</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Deal Name:</strong> {dealData.Deal_Name || dealData.DealName || 'N/A'}</p>
                    {dealData.Visa_Type && <p><strong>Visa Type:</strong> {dealData.Visa_Type}</p>}
                    {dealData.Stage && <p><strong>Stage:</strong> {dealData.Stage}</p>}
                    {dealData.id && <p className="text-xs text-green-600"><strong>Deal ID:</strong> {dealData.id}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
          
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

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
