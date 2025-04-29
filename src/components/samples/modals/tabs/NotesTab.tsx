import React from 'react';
import { MessageSquare } from 'lucide-react';

interface Note {
  id: string;
  user: string;
  date: string;
  content: string;
}

interface NotesTabProps {
  notes: Note[];
  onAddNote: (content: string) => void;
}

export default function NotesTab({ notes, onAddNote }: NotesTabProps) {
  const [newNote, setNewNote] = React.useState('');

  return (
    <div className="space-y-4">
      {/* Add Note Form */}
      <div className="mb-6">
        <textarea
          placeholder="Add a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <div className="mt-2 flex justify-end">
          <button 
            onClick={() => {
              if (newNote.trim()) {
                onAddNote(newNote);
                setNewNote('');
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Add Note
          </button>
        </div>
      </div>

      {/* Notes List */}
      {notes.map((note) => (
        <div
          key={note.id}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {note.user}
                </span>
                <span className="text-xs text-gray-500">{note.date}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {note.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}