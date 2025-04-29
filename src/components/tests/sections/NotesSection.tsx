import React, { useState } from 'react';
import { useTests } from '../../../context/TestContext';

interface Note {
  id: string;
  content: string;
  timestamp: string;
  user: string;
}

interface NotesSectionProps {
  testId: string;
  notes: Note[];
}

export default function NotesSection({ testId, notes }: NotesSectionProps) {
  const { addNote } = useTests();
  const [newNote, setNewNote] = useState('');

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-4">Notes</h3>
      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">{note.user}</span>
              <span className="text-xs text-gray-500">
                {new Date(note.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-600">{note.content}</p>
          </div>
        ))}
        <div className="space-y-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <button
            onClick={() => {
              if (newNote.trim()) {
                addNote(testId, newNote, 'John Doe');
                setNewNote('');
              }
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
}