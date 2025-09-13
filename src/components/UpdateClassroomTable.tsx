"use client";

import { useState, useEffect } from 'react';
import { ClassroomRecord, UpdateProps } from "@/app/update-classroom/page";

interface UpdateClassroomTableProps {
  classrooms: ClassroomRecord[];
  onClassroomUpdate: ({
    recordId,
    oldData,
    newData,
  }: UpdateProps) => Promise<void>;
  onClassroomChange?: (classrooms: ClassroomRecord[]) => void;
}

export default function UpdateClassroomTable({ 
  classrooms, 
  onClassroomUpdate, 
  onClassroomChange 
}: UpdateClassroomTableProps) {
  const [editingValues, setEditingValues] = useState<{ [key: string]: { class_name: string; grade: number } }>({});
  const [saving, setSaving] = useState<string | null>(null);

  // Initialize editing values when classrooms change
  useEffect(() => {
    const initialValues: { [key: string]: { class_name: string; grade: number } } = {};
    classrooms.forEach(record => {
      initialValues[record.id] = {
        class_name: record.class_name,
        grade: record.grade
      };
    });
    setEditingValues(initialValues);
  }, [classrooms]);

  const handleValueChange = (recordId: string, field: 'class_name' | 'grade', newValue: string | number) => {
    setEditingValues(prev => ({
      ...prev,
      [recordId]: {
        ...prev[recordId],
        [field]: field === 'grade' ? Number(newValue) : String(newValue)
      }
    }));
  };

  const handleSaveClassroom = async (recordId: string) => {
    const record = classrooms.find(c => c.id === recordId);
    if (!record) return;

    const newData = editingValues[recordId];
    const oldData = {
      class_name: record.class_name,
      grade: record.grade
    };

    // Check if there are any changes
    if (newData.class_name === oldData.class_name && newData.grade === oldData.grade) {
      return; // No changes
    }

    setSaving(recordId);

    try {
      await onClassroomUpdate({
        recordId,
        oldData,
        newData
      });
      
      // Update parent component's classroom state
      if (onClassroomChange) {
        const updatedClassrooms = classrooms.map(c =>
          c.id === recordId ? { ...c, ...newData } : c
        );
        onClassroomChange(updatedClassrooms);
      }
    } catch (error) {
      // Revert the editing values on error
      setEditingValues(prev => ({
        ...prev,
        [recordId]: oldData
      }));
      throw error; // Re-throw so parent can handle
    } finally {
      setSaving(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, recordId: string) => {
    if (e.key === 'Enter') {
      handleSaveClassroom(recordId);
    }
  };

  const hasChanges = (recordId: string) => {
    const record = classrooms.find(c => c.id === recordId);
    if (!record) return false;
    
    const editingValue = editingValues[recordId];
    if (!editingValue) return false;
    
    return editingValue.class_name !== record.class_name || editingValue.grade !== record.grade;
  };

  if (classrooms.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Classroom Data
        </h2>
        <p className="text-gray-500">No classroom data found</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Classroom Data
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
                Class Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classrooms.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.student_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.student_email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <input
                    type="text"
                    value={editingValues[record.id]?.class_name || ''}
                    onChange={(e) => 
                      handleValueChange(record.id, 'class_name', e.target.value)
                    }
                    onKeyPress={(e) => handleKeyPress(e, record.id)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={saving === record.id}
                    placeholder="Enter class name"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={editingValues[record.id]?.grade || 0}
                    onChange={(e) => 
                      handleValueChange(record.id, 'grade', parseInt(e.target.value) || 0)
                    }
                    onKeyPress={(e) => handleKeyPress(e, record.id)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={saving === record.id}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleSaveClassroom(record.id)}
                    disabled={
                      saving === record.id || 
                      !hasChanges(record.id)
                    }
                    className={`
                      px-3 py-1 rounded-md text-xs font-medium transition-colors
                      ${saving === record.id 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : !hasChanges(record.id)
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
