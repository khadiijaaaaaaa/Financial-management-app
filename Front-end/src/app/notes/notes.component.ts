import { Component } from '@angular/core';

interface Note {
  id: number;
  content: string;
}

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent {
  notes: Note[] = [];
  newNoteContent: string = '';
  editNoteId: number | null = null;
  editedNoteContent: string = '';

  // Add a new note
  addNote() {
    if (this.newNoteContent.trim()) {
      const newNote: Note = {
        id: Date.now(), // Unique ID based on timestamp
        content: this.newNoteContent
      };
      this.notes.push(newNote);
      this.newNoteContent = ''; // Clear input
    }
  }

  // Edit a note
  startEditNote(note: Note) {
    this.editNoteId = note.id;
    this.editedNoteContent = note.content;
  }

  saveEditedNote() {
    const noteIndex = this.notes.findIndex(note => note.id === this.editNoteId);
    if (noteIndex !== -1) {
      this.notes[noteIndex].content = this.editedNoteContent;
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.editNoteId = null;
    this.editedNoteContent = '';
  }

  // Delete a note
  deleteNote(noteId: number) {
    this.notes = this.notes.filter(note => note.id !== noteId);
  }
}