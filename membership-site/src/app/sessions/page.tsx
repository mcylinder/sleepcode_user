'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


interface Session {
  id: string;
  title: string;
  length: string; // format: "minute:second"
  reader: string;
  created: string; // date string
}

interface Draft {
  id: string;
  title: string;
  description: string;
}

export default function SessionsPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    reader: '',
    description: ''
  });

  // Reader names for dropdown
  const readerNames = ['Sarah', 'Michael', 'Emma', 'David', 'Lisa'];

  // Form handlers
  const handleNewSession = () => {
    setEditingDraft(null);
    setFormData({ title: '', reader: '', description: '' });
    setShowForm(true);
  };

  const handleEditDraft = (draft: Draft) => {
    setEditingDraft(draft);
    setFormData({
      title: draft.title,
      reader: '', // Drafts don't have reader yet
      description: draft.description
    });
    setShowForm(true);
  };

  const handleSaveDraft = () => {
    if (editingDraft) {
      // Update existing draft
      setDrafts(drafts.map(draft => 
        draft.id === editingDraft.id 
          ? { ...draft, title: formData.title, description: formData.description }
          : draft
      ));
    } else {
      // Create new draft
      const newDraft: Draft = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description
      };
      setDrafts([...drafts, newDraft]);
    }
    setShowForm(false);
    setEditingDraft(null);
    setFormData({ title: '', reader: '', description: '' });
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingDraft(null);
    setFormData({ title: '', reader: '', description: '' });
  };

  const handleRemoveDraft = () => {
    if (editingDraft) {
      setDrafts(drafts.filter(draft => draft.id !== editingDraft.id));
    }
    setShowForm(false);
    setEditingDraft(null);
    setFormData({ title: '', reader: '', description: '' });
  };

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    // Simulate loading sessions and drafts
    const loadData = async () => {
      // Mock data for sessions
      const mockSessions: Session[] = [
        {
          id: '1',
          title: 'Introduction to Sleep Science',
          length: '15:30',
          reader: 'Sarah',
          created: '2024-01-15'
        },
        {
          id: '2',
          title: 'Deep Breathing Techniques',
          length: '12:45',
          reader: 'Michael',
          created: '2024-01-14'
        },
        {
          id: '3',
          title: 'Progressive Muscle Relaxation',
          length: '18:20',
          reader: 'Emma',
          created: '2024-01-13'
        },
        {
          id: '4',
          title: 'Mindfulness Meditation',
          length: '10:15',
          reader: 'David',
          created: '2024-01-12'
        },
        {
          id: '5',
          title: 'Sleep Hygiene Basics',
          length: '14:30',
          reader: 'Lisa',
          created: '2024-01-11'
        }
      ];

      // Mock data for drafts
      const mockDrafts: Draft[] = [
        {
          id: '1',
          title: 'Advanced Sleep Techniques',
          description: 'A comprehensive guide to advanced sleep optimization methods including biofeedback and cognitive behavioral therapy techniques.'
        },
        {
          id: '2',
          title: 'Stress Management for Better Sleep',
          description: 'Practical strategies for managing stress and anxiety that interfere with sleep quality and duration.'
        },
        {
          id: '3',
          title: 'Nutrition and Sleep Connection',
          description: 'Exploring the relationship between diet, nutrition timing, and sleep quality with actionable recommendations.'
        }
      ];

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSessions(mockSessions);
      setDrafts(mockDrafts);
    };

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
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
                          <button className="text-blue-600 hover:text-blue-900 font-medium">
                            View
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
                  <div key={session.id} className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-sm font-medium text-gray-900 flex-1 pr-4">
                        {session.title}
                      </h3>
                      <button className="text-blue-600 hover:text-blue-900 font-medium text-sm">
                        View
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
                  Blank sessions available: <span className="font-medium">3</span>
                </div>
              </div>

              {/* Light Gray Line */}
              <div className="mt-4 border-t border-gray-200"></div>

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
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {drafts.map((draft) => (
                        <tr key={draft.id} className="hover:bg-gray-50">
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
                            <button 
                              onClick={() => handleEditDraft(draft)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Drafts Cards - Mobile */}
                <div className="md:hidden space-y-4">
                  {drafts.map((draft) => (
                    <div key={draft.id} className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-sm font-medium text-gray-900 flex-1 pr-4">
                          {draft.title}
                        </h3>
                        <button 
                          onClick={() => handleEditDraft(draft)}
                          className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                        >
                          Edit
                        </button>
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

              {/* New Session Form Section */}
              <div className="mt-8">
                <button
                  onClick={showForm ? handleCancelEdit : handleNewSession}
                  className="flex items-center text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                >
                  <span className={`mr-2 transition-transform ${showForm ? 'rotate-90' : ''}`}>
                    ▶
                  </span>
                  {showForm ? 'Cancel' : 'New Session'}
                </button>

                {showForm && (
                  <div className="mt-4 bg-white shadow-sm rounded-lg p-6 border border-gray-200">
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
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter session title"
                          />
                        </div>

                        {/* Reader Dropdown */}
                        <div>
                          <label htmlFor="reader" className="block text-sm font-medium text-gray-700 mb-2">
                            Reader
                          </label>
                          <select
                            id="reader"
                            value={formData.reader}
                            onChange={(e) => setFormData({ ...formData, reader: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select a reader</option>
                            {readerNames.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
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
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              rows={4}
                              maxLength={300}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none ${
                                formData.description.length > 300 ? 'border-red-500' :
                                formData.description.length > 280 ? 'border-orange-500' : ''
                              }`}
                              placeholder="Enter session description (max 300 characters)"
                            />
                            <div className={`text-xs mt-1 text-right ${
                              formData.description.length > 300 ? 'text-red-600' :
                              formData.description.length > 280 ? 'text-orange-600' : 'text-gray-500'
                            }`}>
                              {formData.description.length}/300
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="submit"
                            className="btn-primary"
                          >
                            Save Draft
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="btn-secondary"
                          >
                            Cancel Edit
                          </button>
                          {editingDraft && (
                            <button
                              type="button"
                              onClick={handleRemoveDraft}
                              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              Remove Draft
                            </button>
                          )}
                        </div>

                        {/* Render Button (disabled for now) */}
                        <div className="pt-4 border-t border-gray-200">
                          <button
                            type="button"
                            disabled
                            className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed"
                          >
                            Render (Requirements not met)
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
    </div>
  );
} 