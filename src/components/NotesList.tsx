import React from 'react';
import { Note, User } from '../types';
import { PlusCircle, Edit, Trash } from 'lucide-react';

interface NotesListProps {
  notes: Note[];
  currentUser: User;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onAdd: () => void;
}

export default function NotesList({ notes, currentUser, onEdit, onDelete, onAdd }: NotesListProps) {
  const canCreate = ['admin', 'teacher'].includes(currentUser.role);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Notes</h2>
        {canCreate && (
          <button
            onClick={onAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Note
          </button>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{note.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-3">{note.content}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              {(currentUser.role === 'admin' || note.authorId === currentUser.id) && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(note)}
                    className="p-1 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(note.id)}
                    className="p-1 hover:text-red-600"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}