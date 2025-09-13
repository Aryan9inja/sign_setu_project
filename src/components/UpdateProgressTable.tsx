'use client';

import { useState, useEffect } from 'react';
import { ProgressRecord } from '@/app/update-progress/page';

interface UpdateProgressTableProps {
  progress: ProgressRecord[];
  onProgressUpdate: (recordId: string, oldProgress: number, newProgress: number) => Promise<void>;
  onProgressChange?: (progress: ProgressRecord[]) => void;
}

export default function UpdateProgressTable({ 
  progress, 
  onProgressUpdate, 
  onProgressChange 
}: UpdateProgressTableProps) {
  const [editingValues, setEditingValues] = useState<{ [key: string]: number }>({});
  const [saving, setSaving] = useState<string | null>(null);

  // Initialize editing values when progress changes
  useEffect(() => {
    const initialValues: { [key: string]: number } = {};
    progress.forEach(record => {
      initialValues[record.id] = record.progress_percent;
    });
    setEditingValues(initialValues);
  }, [progress]);

  const handleProgressChange = (recordId: string, newValue: number) => {
    setEditingValues(prev => ({
      ...prev,
      [recordId]: newValue
    }));
  };

  const handleSaveProgress = async (recordId: string) => {
    const record = progress.find(p => p.id === recordId);
    if (!record) return;

    const newProgress = editingValues[recordId];
    const oldProgress = record.progress_percent;

    if (newProgress === oldProgress) return; // No change

    setSaving(recordId);

    try {
      await onProgressUpdate(recordId, oldProgress, newProgress);
      
      // Update parent component's progress state
      if (onProgressChange) {
        const updatedProgress = progress.map(p =>
          p.id === recordId ? { ...p, progress_percent: newProgress } : p
        );
        onProgressChange(updatedProgress);
      }
    } catch (error) {
      // Revert the editing value on error
      setEditingValues(prev => ({
        ...prev,
        [recordId]: oldProgress
      }));
      throw error; // Re-throw so parent can handle
    } finally {
      setSaving(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, recordId: string) => {
    if (e.key === 'Enter') {
      handleSaveProgress(recordId);
    }
  };

  if (progress.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Student Progress Data
        </h2>
        <p className="text-gray-500">No progress data found</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Student Progress Data
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress Percent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {progress.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.student_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.student_email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingValues[record.id] || 0}
                    onChange={(e) => 
                      handleProgressChange(record.id, parseInt(e.target.value) || 0)
                    }
                    onKeyPress={(e) => handleKeyPress(e, record.id)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={saving === record.id}
                  />
                  <span className="ml-1 text-gray-500">%</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleSaveProgress(record.id)}
                    disabled={
                      saving === record.id || 
                      editingValues[record.id] === record.progress_percent
                    }
                    className={`
                      px-3 py-1 rounded-md text-xs font-medium transition-colors
                      ${saving === record.id 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : editingValues[record.id] === record.progress_percent
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                      }
                    `}
                  >
                    {saving === record.id ? 'Saving...' : 'Save'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}