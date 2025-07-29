'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  Session, 
  UserSessionCount,
  createSession, 
  updateSession, 
  deleteSession, 
  getSession, 
  getUserSessions, 
  duplicateSession,
  getUserSessionCount,
  decrementAvailableSessions,
  hasContentChanged
} from '@/lib/draftService';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Constants
const DESCRIPTION_MIN_CHARS = 60;
const DESCRIPTION_MAX_CHARS = 300;
const INSTRUCTION_MAX_CHARS = 120;

// Reader data with audio files
const READERS = [
  { id: 'dPah2VEoifKnZT37774q', name: 'Richard', audioFile: 'richard_BLfDBmTGrg0wmQlW1MrB.m4a' },
  { id: 'aq9iUe9e2C6iTZNQA0Sq', name: 'Noah', audioFile: 'noah2_aq9iUe9e2C6iTZNQA0Sq.m4a' },
  { id: 'BLfDBmTGrg0wmQlW1MrB', name: 'Grace', audioFile: 'grace2_BLfDBmTGrg0wmQlW1MrB.m4a' },
  { id: 'hMNJ8tdWG8JbmDXqXdHz', name: 'Oliver', audioFile: 'oliver2_hMNJ8tdWG8JbmDXqXdHz.m4a' },
  { id: '64FFCb8N3xvQIxVA46HI', name: 'Charlotte', audioFile: 'charlotte2_64FFCb8N3xvQIxVA46HI.m4a' },
  { id: 'itjA83RExdsQkFbXkihc', name: 'Micah', audioFile: 'micah_itjA83RExdsQkFbXkihc.m4a' }
];

// Sortable Item Component
function SortableItem({ 
  instruction, 
  index, 
  onInstructionChange, 
  onClearInstruction,
  textareaRef,
  isDisabled
}: { 
  instruction: string; 
  index: number; 
  onInstructionChange: (index: number, value: string) => void;
  onClearInstruction: (index: number) => void;
  textareaRef: (el: HTMLTextAreaElement | null) => void;
  isDisabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `instruction-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
        isDragging ? 'bg-cyan-50 border-2 border-cyan-200 opacity-50' : ''
      }`}
    >
      {/* Drag Handle */}
      <div 
        {...(isDisabled ? {} : attributes)} 
        {...(isDisabled ? {} : listeners)}
        className={`flex-shrink-0 ${
          isDisabled 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'cursor-move text-gray-400 hover:text-gray-600'
        }`}
        onClick={() => {
          if (isDisabled) {
            alert("A description about your goal is required.");
          }
        }}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zm6-8a2 2 0 1 1-.001-4.001A2 2 0 0 1 13 6zm0 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z" />
        </svg>
      </div>
      
      {/* Input Field */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={instruction}
          onChange={(e) => onInstructionChange(index, e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 pr-12 text-sm placeholder:text-gray-300 placeholder:text-xs placeholder:font-serif instruction-textarea ${
            isDisabled 
              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
              : 'border-gray-300'
          }`}
          placeholder={isDisabled ? "Add description first" : "instruction"}
          rows={1}
          disabled={isDisabled}
          style={{
            height: 'auto',
            minHeight: '40px'
          }}
          onInput={(e) => {
            if (!isDisabled) {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, INSTRUCTION_MAX_CHARS) + 'px';
            }
          }}
          onClick={() => {
            if (isDisabled) {
              alert("A description about your goal is required.");
            }
          }}
        />
        
        {/* Character Count */}
        {instruction.length > INSTRUCTION_MAX_CHARS && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-red-600 font-medium">
            {instruction.length}:{INSTRUCTION_MAX_CHARS}
          </div>
        )}
      </div>
      
      {/* Clear Button */}
      <button
        type="button"
        onClick={() => {
          if (isDisabled) {
            alert("A description about your goal is required.");
            return;
          }
          onClearInstruction(index);
        }}
        className={`flex-shrink-0 p-1 focus:outline-none ${
          isDisabled 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-400 hover:text-gray-600'
        }`}
        title={isDisabled ? "Add description first" : "Clear field"}
        disabled={isDisabled}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

interface SessionDisplay {
  id: string;
  title: string;
  length: string; // format: "minute:second"
  reader: string;
  created: string; // date string
}



export default function SessionsPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionDisplay[]>([]);
  const [drafts, setDrafts] = useState<Session[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDraft, setEditingDraft] = useState<Session | null>(null);
  const [currentDraft, setCurrentDraft] = useState<Session | null>(null);
  const [userSessionCount, setUserSessionCount] = useState<UserSessionCount | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    reader: '',
    description: ''
  });
  const [instructions, setInstructions] = useState<string[]>(Array(15).fill(''));
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [lastSavedContent, setLastSavedContent] = useState<string>('');
  const [formSaved, setFormSaved] = useState(false);

  // Audio playback state
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingReader, setPlayingReader] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Bulk paste modal state
  const [showBulkPasteModal, setShowBulkPasteModal] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState('');

  // Form handlers
  const handleNewSession = () => {
    setEditingDraft(null);
    setCurrentDraft(null);
    setFormSaved(false);
    setFormData({ title: '', reader: '', description: '' });
    setInstructions(Array(15).fill(''));
    setSuggestions([]);
    setShowForm(true);
  };

  const handleEditDraft = (draft: Session) => {
    setEditingDraft(draft);
    setCurrentDraft(draft);
    setFormSaved(false);
    setFormData({
      title: draft.title,
      reader: draft.reader || '',
      description: draft.description
    });
    setInstructions(draft.instructions || Array(15).fill(''));
    setSuggestions(draft.suggestions || []);
    setShowForm(true);
  };

  const handleSaveDraft = async () => {
    if (!currentUser) return;

    try {
      if (editingDraft || currentDraft) {
        // Update existing draft - use either editingDraft or currentDraft
        const draftToUpdate = editingDraft || currentDraft;
        await updateSession(currentUser.uid, draftToUpdate!.id!, {
          title: formData.title,
          description: formData.description,
          reader: formData.reader,
          instructions: instructions,
          suggestions: suggestions
        });
        
        // Update local state
        setDrafts(drafts.map(draft => 
          draft.id === draftToUpdate!.id 
            ? { ...draft, title: formData.title, description: formData.description, reader: formData.reader, instructions: instructions, suggestions: suggestions }
            : draft
        ));
        
        // Update currentDraft to the updated session
        setCurrentDraft({ ...draftToUpdate!, title: formData.title, description: formData.description, reader: formData.reader, instructions: instructions, suggestions: suggestions });
      } else {
        // Create new draft
        const newSession: Omit<Session, 'id' | 'createdAt' | 'updatedAt'> = {
          title: formData.title,
          description: formData.description,
          reader: formData.reader,
          instructions: instructions,
          suggestions: suggestions,
          userId: currentUser.uid,
          status: 'in_edit'
        };
        
        const sessionId = await createSession(newSession);
        const createdSession = await getSession(currentUser.uid, sessionId);
        
        if (createdSession) {
          setDrafts([createdSession, ...drafts]);
          // Set currentDraft to the created session so render button works
          setCurrentDraft(createdSession);
        }
      }
      
      setFormSaved(true);
      setEditingDraft(null);
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Error saving draft. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingDraft(null);
    setFormSaved(false);
    setFormData({ title: '', reader: '', description: '' });
    setInstructions(Array(15).fill(''));
  };

  const handleClearDraft = () => {
    if (confirm('Are you sure? This will clear all form data.')) {
      setFormData({ title: '', reader: '', description: '' });
      setInstructions(Array(15).fill(''));
      setSuggestions([]);
      setFormSaved(false);
      setEditingDraft(null);
      setCurrentDraft(null);
      setShowForm(false);
    }
  };

  const handleRender = async () => {
    if (!currentUser || (!editingDraft && !currentDraft)) return;

    const draftToRender = editingDraft || currentDraft;
    if (!draftToRender) return;

    try {
      console.log('Starting render process for draft:', draftToRender.id);
      
      // Update session status to 'to_render'
      console.log('Updating session status...');
      await updateSession(currentUser.uid, draftToRender.id!, {
        status: 'to_render'
      });
      console.log('Session status updated successfully');
      
      // Decrement available sessions
      console.log('Decrementing available sessions...');
      await decrementAvailableSessions(currentUser.uid);
      console.log('Available sessions decremented successfully');
      
      // Remove from drafts list and add to sessions
      setDrafts(drafts.filter(draft => draft.id !== draftToRender.id));
      
      // Reset form and close
      setShowForm(false);
      setEditingDraft(null);
      setCurrentDraft(null);
      setFormSaved(false);
      setFormData({ title: '', reader: '', description: '' });
      setInstructions(Array(15).fill(''));
      
      // Refresh session count
      console.log('Refreshing session count...');
      const sessionCount = await getUserSessionCount(currentUser.uid);
      setUserSessionCount(sessionCount);
      console.log('Session count refreshed:', sessionCount);
      
      // Reload data to include the new session in the sessions table
      console.log('Reloading data...');
      await loadData();
      console.log('Data reloaded successfully');
      
      // No alert - just update the status and move to sessions
    } catch (error) {
      console.error('Error rendering session:', error);
      alert('Error submitting session for rendering. Please try again.');
    }
  };



  // Instruction handlers
  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
    setFormSaved(false);
  };

  const handleClearInstruction = (index: number) => {
    const newInstructions = [...instructions];
    newInstructions[index] = '';
    setInstructions(newInstructions);
    setFormSaved(false);
  };

  // DnD Kit setup
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setInstructions((items) => {
        const oldIndex = items.findIndex((_, index) => `instruction-${index}` === active.id);
        const newIndex = items.findIndex((_, index) => `instruction-${index}` === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Reset textarea heights when instructions change (after reordering)
  useEffect(() => {
    textareaRefs.current.forEach((textarea) => {
      if (textarea) {
        textarea.style.height = 'auto';
        if (textarea.value.trim()) {
          textarea.style.height = Math.min(textarea.scrollHeight, INSTRUCTION_MAX_CHARS) + 'px';
        } else {
          textarea.style.height = '40px';
        }
      }
    });
  }, [instructions]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!currentUser || !currentDraft) return;

    const currentContent = JSON.stringify({
      title: formData.title,
      description: formData.description,
      reader: formData.reader,
      instructions: instructions,
      suggestions: suggestions
    });

    if (currentContent !== lastSavedContent && hasContentChanged(currentDraft, currentDraft)) {
      try {
        await updateSession(currentUser.uid, currentDraft.id!, {
          title: formData.title,
          description: formData.description,
          reader: formData.reader,
          instructions: instructions,
          suggestions: suggestions
        });
        setLastSavedContent(currentContent);
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }
  }, [currentUser, currentDraft, formData, instructions, suggestions, lastSavedContent]);

  // Set up auto-save timer
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    if (currentDraft && currentUser) {
      const timer = setInterval(autoSave, 10000); // 10 seconds
      autoSaveTimerRef.current = timer;
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [currentDraft, currentUser, autoSave]);

  // Suggestions functions
  const getSuggestions = async () => {
    if (!formData.title.trim()) {
      alert("A title is required before getting suggestions.");
      return;
    }
    
    if (formData.description.length < DESCRIPTION_MIN_CHARS) {
      alert("A description about your goal is required.");
      return;
    }

    // Check if we already have suggestions for this content
    if (suggestions.length > 0) {
      setShowSuggestions(true);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: formData.description }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get suggestions');
      }

      setSuggestions(data.suggestions);
      
      // Store suggestions in current draft if it exists
      if (currentDraft && currentUser) {
        try {
                  await updateSession(currentUser.uid, currentDraft.id!, {
          suggestions: data.suggestions
        });
        } catch (error) {
          console.error('Error saving suggestions:', error);
        }
      }
      
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      alert('Having trouble with suggestions. Try again later.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const addSuggestionToInstructions = (suggestion: string) => {
    const newInstructions = [...instructions];
    const emptyIndex = newInstructions.findIndex(instruction => !instruction.trim());
    
    if (emptyIndex !== -1) {
      newInstructions[emptyIndex] = suggestion;
      setInstructions(newInstructions);
    }
  };

  const isSuggestionUsed = (suggestion: string) => {
    return instructions.some(instruction => instruction.trim() === suggestion.trim());
  };

  const hasEmptyInstructions = () => {
    return instructions.some(instruction => !instruction.trim());
  };

  const getEmptySlotCount = () => {
    return instructions.filter(instruction => !instruction.trim()).length;
  };

  const getNonEmptyInstructionCount = () => {
    return instructions.filter(instruction => instruction.trim() !== '').length;
  };

  // Audio playback functions
  const playAudio = (readerName: string, audioFile: string) => {
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    // Create new audio element
    const audio = new Audio(`/assets/audio/${audioFile}`);
    audio.volume = 0.75;
    audio.loop = true;
    
    audio.addEventListener('ended', () => {
      setPlayingReader(null);
      setCurrentAudio(null);
    });

    audio.play().then(() => {
      setCurrentAudio(audio);
      setPlayingReader(readerName);
    }).catch((error) => {
      console.error('Error playing audio:', error);
    });
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setPlayingReader(null);
    }
  };

  const toggleAudio = (readerName: string, audioFile: string) => {
    if (playingReader === readerName) {
      stopAudio();
    } else {
      playAudio(readerName, audioFile);
    }
  };

  // Bulk paste instructions function
  const handleBulkPaste = () => {
    if (!bulkPasteText.trim()) return;
    
    const lines = bulkPasteText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const newInstructions = [...instructions];
    
    let lineIndex = 0;
    for (let i = 0; i < newInstructions.length && lineIndex < lines.length; i++) {
      if (!newInstructions[i].trim()) {
        newInstructions[i] = lines[lineIndex];
        lineIndex++;
      }
    }
    
    setInstructions(newInstructions);
    setBulkPasteText('');
    setShowBulkPasteModal(false);
    setFormSaved(false);
  };

  // Stop audio when dropdown closes
  useEffect(() => {
    if (!isDropdownOpen && currentAudio) {
      stopAudio();
    }
  }, [isDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && !(event.target as Element).closest('.reader-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  // Load data function
  const loadData = async () => {
    // Load user drafts and session count from Firestore
    if (currentUser) {
      try {
        const userSessions = await getUserSessions(currentUser.uid);
        const sessionCount = await getUserSessionCount(currentUser.uid);
        
        // Add default status to existing sessions that don't have it
        const sessionsWithStatus = userSessions.map(session => ({
          ...session,
          status: session.status || 'in_edit'
        }));
        
        setDrafts(sessionsWithStatus);
        setUserSessionCount(sessionCount);
        
        // Only show sessions that are being rendered (not in_edit)
        const renderingSessions = sessionsWithStatus.filter(session => session.status !== 'in_edit').map(session => ({
          id: session.id!,
          title: session.title,
          length: '00:00', // Placeholder until rendered
          reader: session.reader,
          created: session.createdAt?.toDate().toISOString() || new Date().toISOString()
        }));
        
        setSessions(renderingSessions);
      } catch (error) {
        console.error('Error loading drafts:', error);
      }
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);





  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-white sm:bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-2 py-6 sm:px-0">
          <div className="bg-white shadow-sm">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
              </div>

              {/* Sessions Table - Desktop */}
              <div className="hidden md:block overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Length
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reader
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        View
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sessions.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {session.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.reader}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(session.created).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-cyan-700 hover:text-cyan-900 font-medium">
                            {session.length === '00:00' ? 'Rendering' : 'View'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sessions Cards - Mobile */}
              <div className="md:hidden space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="p-2">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-sm font-medium text-gray-900 flex-1 pr-4">
                        {session.title}
                      </h3>
                      <button className="text-cyan-700 hover:text-cyan-900 font-medium text-sm">
                        {session.length === '00:00' ? 'Rendering' : 'View'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Length:</span>
                        <span className="ml-1 text-gray-900">{session.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Reader:</span>
                        <span className="ml-1 text-gray-900">{session.reader}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Created:</span>
                        <span className="ml-1 text-gray-900">{new Date(session.created).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Blank Sessions Available */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Blank sessions available: <span className="font-medium">{userSessionCount?.availableSessions || 3}</span>
                </div>
              </div>

              {/* Light Gray Line */}
              <div className="mt-4 border-t border-gray-200 md:block hidden"></div>
              
              {/* Mobile Separator */}
              <div className="md:hidden border-t border-gray-200 my-6"></div>

              {/* Drafts Section */}
              <div className="mt-8">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Drafts</h2>
                </div>

                {/* Drafts Table - Desktop */}
                <div className="hidden md:block overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Modified
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {drafts.filter(draft => draft.status === 'in_edit').map((draft) => (
                        <tr key={draft.id} className={`hover:bg-gray-50 ${
                          editingDraft?.id === draft.id ? 'bg-cyan-50 border-l-4 border-cyan-500' : ''
                        }`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {draft.title}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="max-w-xs">
                              {draft.description.length > 40 
                                ? `${draft.description.substring(0, 40)}...` 
                                : draft.description
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {draft.updatedAt ? new Date(draft.updatedAt.toDate()).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditDraft(draft)}
                                className="px-3 py-1 text-xs font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-md hover:bg-cyan-100 hover:border-cyan-300 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={async () => {
                                  if (currentUser && confirm('Duplicate this draft?')) {
                                    try {
                                      await duplicateSession(currentUser.uid, draft.id!);
                                      // Reload drafts
                                      const userSessions = await getUserSessions(currentUser.uid);
                                      setDrafts(userSessions);
                                    } catch (error) {
                                      console.error('Error duplicating draft:', error);
                                      alert('Error duplicating draft. Please try again.');
                                    }
                                  }
                                }}
                                className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:border-green-300 transition-colors"
                              >
                                Duplicate
                              </button>
                              <button
                                onClick={async () => {
                                  if (currentUser && confirm('Delete this draft?')) {
                                    try {
                                      await deleteSession(currentUser.uid, draft.id!);
                                      setDrafts(drafts.filter(d => d.id !== draft.id));
                                    } catch (error) {
                                      console.error('Error deleting draft:', error);
                                      alert('Error deleting draft. Please try again.');
                                    }
                                  }
                                }}
                                className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Drafts Cards - Mobile */}
                <div className="md:hidden space-y-4">
                  {drafts.filter(draft => draft.status === 'in_edit').map((draft) => (
                    <div key={draft.id} className={`p-2 ${
                      editingDraft?.id === draft.id ? 'bg-cyan-50 border-l-4 border-cyan-500 rounded-r-md' : ''
                    }`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 pr-4">
                          <h3 className="text-sm font-medium text-gray-900">{draft.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {draft.updatedAt ? new Date(draft.updatedAt.toDate()).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button 
                            onClick={() => handleEditDraft(draft)}
                            className="px-3 py-1 text-xs font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-md hover:bg-cyan-100 hover:border-cyan-300 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (currentUser && confirm('Duplicate this draft?')) {
                                try {
                                  await duplicateSession(currentUser.uid, draft.id!);
                                  const userSessions = await getUserSessions(currentUser.uid);
                                  setDrafts(userSessions);
                                } catch (error) {
                                  console.error('Error duplicating draft:', error);
                                  alert('Error duplicating draft. Please try again.');
                                }
                              }
                            }}
                            className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:border-green-300 transition-colors"
                          >
                            Duplicate
                          </button>
                          <button
                            onClick={async () => {
                              if (currentUser && confirm('Delete this draft?')) {
                                try {
                                  await deleteSession(currentUser.uid, draft.id!);
                                  setDrafts(drafts.filter(d => d.id !== draft.id));
                                } catch (error) {
                                  console.error('Error deleting draft:', error);
                                  alert('Error deleting draft. Please try again.');
                                }
                              }
                            }}
                            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {draft.description.length > 40 
                          ? `${draft.description.substring(0, 40)}...` 
                          : draft.description
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Separator */}
              <div className="md:hidden border-t border-gray-200 my-6"></div>
              
              {/* New Session Form Section */}
              <div className="mt-8">
                                  <button
                    onClick={showForm ? handleCancelEdit : handleNewSession}
                    className="flex items-center text-lg font-medium text-gray-900 hover:text-cyan-700 transition-colors"
                  >
                    <span className={`mr-2 transition-transform ${showForm ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                    {showForm ? 'Close' : 'New Session'}
                  </button>

                {showForm && (
                  <div className="mt-4 bg-white shadow-sm rounded-lg p-6 border border-gray-200 md:block hidden">
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveDraft(); }}>
                      <div className="space-y-6">
                        {/* Title Input */}
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            id="title"
                            value={formData.title}
                            onChange={(e) => {
                          setFormData({ ...formData, title: e.target.value });
                          setFormSaved(false);
                        }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 placeholder:text-gray-300 placeholder:text-xs placeholder:font-serif"
                            placeholder="Enter session title"
                          />
                        </div>

                        {/* Instructions Explanation */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 mb-3">
                            Write clear, specific instructions that guide the session toward your goal.
                          </p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Be specific about what you want to achieve or experience</li>
                            <li>• Include any preferences for tone, pace, or style</li>
                            <li>• Consider the order - earlier instructions set the foundation</li>
                          </ul>
                        </div>

                        {/* Reader Dropdown */}
                        <div>
                          <label htmlFor="reader" className="block text-sm font-medium text-gray-700 mb-2">
                            Reader
                          </label>
                          <div className="relative reader-dropdown">
                            <button
                              type="button"
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                              className="w-full px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 bg-white"
                            >
                              {formData.reader || "Select a reader"}
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                ▼
                              </span>
                            </button>
                            
                            {isDropdownOpen && (
                              <div className="absolute z-10 w-full max-w-[220px] mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                {READERS.map((reader) => (
                                  <div
                                    key={reader.id}
                                    className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => {
                                      setFormData({ ...formData, reader: reader.name });
                                      setFormSaved(false);
                                      setIsDropdownOpen(false);
                                    }}
                                  >
                                    <span className="text-sm">{reader.name}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleAudio(reader.name, reader.audioFile);
                                      }}
                                      className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded hover:bg-gray-200 transition-colors"
                                    >
                                      {playingReader === reader.name ? 'Pause' : 'Play'}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Description Textarea */}
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <div className="relative">
                            <textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) => {
                          setFormData({ ...formData, description: e.target.value });
                          setFormSaved(false);
                        }}
                              rows={4}
                              maxLength={DESCRIPTION_MAX_CHARS}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 resize-none placeholder:text-gray-300 placeholder:text-xs placeholder:font-serif ${
                                formData.description.length > DESCRIPTION_MAX_CHARS ? 'border-red-500' :
                                formData.description.length > (DESCRIPTION_MAX_CHARS - 20) ? 'border-orange-500' : ''
                              }`}
                              placeholder={`Enter session description (max ${DESCRIPTION_MAX_CHARS} characters)`}
                            />
                            <div className={`text-xs mt-1 text-right ${
                              formData.description.length > DESCRIPTION_MAX_CHARS ? 'text-red-600' :
                              formData.description.length > (DESCRIPTION_MAX_CHARS - 20) ? 'text-orange-600' : 'text-gray-500'
                            }`}>
                              {formData.description.length}/{DESCRIPTION_MAX_CHARS}
                            </div>
                          </div>
                        </div>

                        {/* Instructions */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                              Instructions
                            </label>
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => setShowBulkPasteModal(true)}
                                disabled={formData.description.length < DESCRIPTION_MIN_CHARS}
                                className={`px-3 py-1 text-sm font-normal rounded-md transition-colors ${
                                  formData.description.length < DESCRIPTION_MIN_CHARS
                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                                    : 'bg-gray-600 text-white hover:bg-gray-700'
                                }`}
                              >
                                Bulk Paste
                              </button>
                              <button
                                type="button"
                                onClick={getSuggestions}
                                disabled={loadingSuggestions}
                                className={`px-3 py-1 text-sm font-normal rounded-md transition-colors ${
                                  loadingSuggestions 
                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                                    : 'bg-cyan-700 text-white hover:bg-cyan-900'
                                }`}
                              >
                                {loadingSuggestions ? 'Loading...' : 'Suggestions ▶'}
                              </button>
                            </div>
                          </div>
                          
                          {formData.description.length < DESCRIPTION_MIN_CHARS && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                              <p className="text-sm text-yellow-800">
                                Please add a description (at least {DESCRIPTION_MIN_CHARS} characters) before writing instructions.
                              </p>
                            </div>
                          )}
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                          >
                            <SortableContext
                              items={instructions.map((_, index) => `instruction-${index}`)}
                              strategy={verticalListSortingStrategy}
                            >
                              <div className="space-y-2">
                                {instructions.map((instruction, index) => (
                                  <SortableItem
                                    key={`instruction-${index}`}
                                    instruction={instruction}
                                    index={index}
                                    onInstructionChange={handleInstructionChange}
                                    onClearInstruction={handleClearInstruction}
                                    textareaRef={(el) => {
                                      textareaRefs.current[index] = el;
                                    }}
                                    isDisabled={formData.description.length < DESCRIPTION_MIN_CHARS}
                                  />
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                                                      <button
                              type="submit"
                              disabled={!formData.title.trim() || !formData.description.trim()}
                              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-2 ${
                                !formData.title.trim() || !formData.description.trim()
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-cyan-700 text-white hover:bg-cyan-900'
                              }`}
                            >
                              <span className="text-sm">
                                {formSaved ? '✓' : '☐'}
                              </span>
                              <span>
                                {!formData.title.trim() || !formData.description.trim() ? 'Save Draft (Title & Description Required)' : 'Save Draft'}
                              </span>
                            </button>
                          <button
                            type="button"
                            onClick={handleClearDraft}
                            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors"
                          >
                            Clear Form
                          </button>
                        </div>

                        {/* Render Button */}
                        <div className="pt-4 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={handleRender}
                            disabled={!(editingDraft || currentDraft) || !formData.title.trim() || !formData.description.trim() || (userSessionCount?.availableSessions || 0) <= 0 || getNonEmptyInstructionCount() < 1}
                            className={`px-4 py-2 text-sm font-medium rounded-md ${
                              !(editingDraft || currentDraft) || !formData.title.trim() || !formData.description.trim() || (userSessionCount?.availableSessions || 0) <= 0 || getNonEmptyInstructionCount() < 1
                                ? 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                                : 'text-white bg-green-600 border border-green-600 hover:bg-green-700'
                            }`}
                          >
                            {!formData.title.trim() || !formData.description.trim() 
                              ? 'Render (Title & Description Required)' 
                              : (userSessionCount?.availableSessions || 0) <= 0
                                ? 'Render (No Sessions Available)'
                                : getNonEmptyInstructionCount() < 1
                                ? 'Render (No Sessions Available)'
                                : 'Render Session'
                            }
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
                
                {/* Mobile Form */}
                {showForm && (
                  <div className="md:hidden mt-4">
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveDraft(); }}>
                      <div className="space-y-6">
                        {/* Title Input */}
                        <div>
                          <label htmlFor="title-mobile" className="block text-sm font-medium text-gray-700 mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            id="title-mobile"
                            value={formData.title}
                            onChange={(e) => {
                              setFormData({ ...formData, title: e.target.value });
                              setFormSaved(false);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 placeholder:text-gray-300 placeholder:text-xs placeholder:font-serif"
                            placeholder="Enter session title"
                          />
                        </div>

                        {/* Reader Dropdown */}
                        <div>
                          <label htmlFor="reader-mobile" className="block text-sm font-medium text-gray-700 mb-2">
                            Reader
                          </label>
                          <div className="relative reader-dropdown">
                            <button
                              type="button"
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                              className="w-full px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 bg-white"
                            >
                              {formData.reader || "Select a reader"}
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                ▼
                              </span>
                            </button>
                            
                            {isDropdownOpen && (
                              <div className="absolute z-10 w-full max-w-[220px] mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                {READERS.map((reader) => (
                                  <div
                                    key={reader.id}
                                    className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => {
                                      setFormData({ ...formData, reader: reader.name });
                                      setFormSaved(false);
                                      setIsDropdownOpen(false);
                                    }}
                                  >
                                    <span className="text-sm">{reader.name}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleAudio(reader.name, reader.audioFile);
                                      }}
                                      className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded hover:bg-gray-200 transition-colors"
                                    >
                                      {playingReader === reader.name ? 'Pause' : 'Play'}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Description Input */}
                        <div>
                          <label htmlFor="description-mobile" className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            id="description-mobile"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => {
                              setFormData({ ...formData, description: e.target.value });
                              setFormSaved(false);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 placeholder:text-gray-300 placeholder:text-xs placeholder:font-serif"
                            placeholder="Describe your goal or intention for this session..."
                          />
                          <div className="mt-1 text-xs text-gray-500">
                            {formData.description.length}/300 characters
                          </div>
                        </div>

                        {/* Instructions Section */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Instructions
                            </label>
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => setShowBulkPasteModal(true)}
                                disabled={!formData.description.trim() || formData.description.length < 60}
                                className={`text-xs px-3 py-1 rounded-md ${
                                  !formData.description.trim() || formData.description.length < 60
                                    ? 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                                    : 'text-white bg-gray-600 border border-gray-600 hover:bg-gray-700'
                                }`}
                              >
                                Bulk Paste
                              </button>
                              <button
                                type="button"
                                onClick={getSuggestions}
                                disabled={!formData.description.trim() || formData.description.length < 60}
                                className={`text-xs px-3 py-1 rounded-md ${
                                  !formData.description.trim() || formData.description.length < 60
                                    ? 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                                    : 'text-white bg-cyan-700 border border-cyan-700 hover:bg-cyan-900'
                                }`}
                              >
                                Suggestions
                              </button>
                            </div>
                          </div>
                          
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                          >
                            <SortableContext
                              items={instructions.map((_, index) => `instruction-${index}`)}
                              strategy={verticalListSortingStrategy}
                            >
                              <div className="space-y-2">
                                {instructions.map((instruction, index) => (
                                  <SortableItem
                                    key={index}
                                    instruction={instruction}
                                    index={index}
                                    onInstructionChange={handleInstructionChange}
                                    onClearInstruction={handleClearInstruction}
                                    textareaRef={(el) => {
                                      if (textareaRefs.current) {
                                        textareaRefs.current[index] = el;
                                      }
                                    }}
                                    isDisabled={!formData.description.trim() || formData.description.length < 60}
                                  />
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!formData.title.trim() || !formData.description.trim()}
                            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center space-x-2 ${
                              !formData.title.trim() || !formData.description.trim()
                                ? 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                                : 'text-white bg-cyan-700 border border-cyan-700 hover:bg-cyan-900'
                            }`}
                          >
                            <span className="text-sm">
                              {formSaved ? '✓' : '☐'}
                            </span>
                            <span>
                              {!formData.title.trim() || !formData.description.trim() ? 'Save Draft (Title & Description Required)' : 'Save Draft'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={handleClearDraft}
                            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors"
                          >
                            Clear Form
                          </button>
                        </div>

                        {/* Render Button */}
                        <div className="pt-4 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={handleRender}
                            disabled={!(editingDraft || currentDraft) || !formData.title.trim() || !formData.description.trim() || (userSessionCount?.availableSessions || 0) <= 0 || getNonEmptyInstructionCount() < 1}
                            className={`px-4 py-2 text-sm font-medium rounded-md ${
                              !(editingDraft || currentDraft) || !formData.title.trim() || !formData.description.trim() || (userSessionCount?.availableSessions || 0) <= 0 || getNonEmptyInstructionCount() < 1
                                ? 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                                : 'text-white bg-green-600 border border-green-600 hover:bg-green-700'
                            }`}
                          >
                            {!formData.title.trim() || !formData.description.trim() 
                              ? 'Render (Title & Description Required)' 
                              : (userSessionCount?.availableSessions || 0) <= 0
                                ? 'Render (No Sessions Available)'
                                : getNonEmptyInstructionCount() < 1
                                ? 'Render (No Sessions Available)'
                                : 'Render Session'
                            }
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Paste Modal */}
      {showBulkPasteModal && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowBulkPasteModal(false)}
          />
          
          {/* Modal */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Bulk Paste Instructions</h3>
                <button
                  onClick={() => setShowBulkPasteModal(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 p-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Paste your instructions below. Each new line will be inserted into the first available empty field.
                  </p>
                  <p className="text-xs text-gray-500">
                    • Empty lines will be ignored<br/>
                    • Only fills empty instruction fields<br/>
                    • Maximum 15 instructions total
                  </p>
                </div>
                
                <textarea
                  value={bulkPasteText}
                  onChange={(e) => setBulkPasteText(e.target.value)}
                  placeholder="Paste your instructions here..."
                  className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-sm resize-none"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowBulkPasteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkPaste}
                  disabled={!bulkPasteText.trim()}
                  className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    bulkPasteText.trim()
                      ? 'text-white bg-cyan-700 hover:bg-cyan-900'
                      : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions Slide-out Panel */}
      <div className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-300 ease-out ${
        showSuggestions ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ease-out ${
            showSuggestions ? 'bg-opacity-50' : 'bg-opacity-0'
          }`}
          onClick={() => setShowSuggestions(false)}
        />
        
        {/* Panel */}
        <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-500 ease-out ${
          showSuggestions ? 'translate-x-0' : 'translate-x-full'
        }`}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Generated Suggestions</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {getEmptySlotCount()} empty slot{getEmptySlotCount() !== 1 ? 's' : ''} available
                  </p>
                </div>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => {
                    const isUsed = isSuggestionUsed(suggestion);
                    const canAdd = !isUsed && hasEmptyInstructions();
                    
                    return (
                      <div 
                        key={index}
                        className={`flex items-center py-2 px-3 rounded-md ${
                          isUsed 
                            ? 'bg-gray-50 text-gray-500' 
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <button
                          onClick={() => addSuggestionToInstructions(suggestion)}
                          disabled={!canAdd}
                          className={`text-xs px-3 py-1 rounded-md flex-shrink-0 mr-3 ${
                            canAdd
                              ? 'bg-cyan-700 text-white hover:bg-cyan-900'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isUsed ? 'Used' : getEmptySlotCount() === 0 ? 'No Slots' : 'Add'}
                        </button>
                        <span className="text-sm text-gray-700 flex-1">{suggestion}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
} 