import { useState } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { createNote, deleteNote, fetchNotes } from '../../services/noteService';
import type { NewNote } from '../../types/note';
import Modal from '../Modal/Modal';
import NoteForm from '../NoteForm/NoteForm';
import NoteList from '../NoteList/NoteList';
import Pagination from '../Pagination/Pagination';
import SearchBox from '../SearchBox/SearchBox';
import css from './App.module.css';

const NOTES_PER_PAGE = 12;

export default function App() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notes', page, searchQuery],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: NOTES_PER_PAGE,
        search: searchQuery || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
      setIsModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const applySearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value.trim());
    setPage(1);
  }, 500);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    applySearch(value);
  };

  const handleCreateNote = async (note: NewNote) => {
    await createMutation.mutateAsync(note);
  };

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={searchInput} onChange={handleSearchChange} />

        {data && data.totalPages > 1 && (
          <Pagination
            pageCount={data.totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        )}

        <button
          className={css.button}
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          Create note +
        </button>
      </header>

      {isLoading && <p role="status">Loading notes...</p>}
      {isError && <p role="alert">Unable to load notes. Please try again.</p>}
      {data && data.notes.length > 0 && (
        <NoteList
          notes={data.notes}
          onDelete={(noteId) => deleteMutation.mutate(noteId)}
          deletingNoteId={
            deleteMutation.isPending ? deleteMutation.variables : undefined
          }
        />
      )}
      {data && data.notes.length === 0 && !isLoading && <p>No notes found.</p>}
      {deleteMutation.isError && (
        <p role="alert">Unable to delete the note. Please try again.</p>
      )}

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm
            onSubmit={handleCreateNote}
            onCancel={() => setIsModalOpen(false)}
          />
          {createMutation.isError && (
            <p role="alert">Unable to create the note. Please try again.</p>
          )}
        </Modal>
      )}
    </div>
  );
}
