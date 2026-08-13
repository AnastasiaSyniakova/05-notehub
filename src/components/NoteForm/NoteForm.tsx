import { ErrorMessage, Field, Form, Formik, type FormikHelpers } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Yup from 'yup';
import { createNote } from '../../services/noteService';
import type { NewNote, NoteTag } from '../../types/note';
import css from './NoteForm.module.css';

const noteTags: NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'];

const initialValues: NewNote = {
  title: '',
  content: '',
  tag: 'Todo',
};

const validationSchema = Yup.object({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(50, 'Title must be at most 50 characters')
    .required('Title is required'),
  content: Yup.string().max(500, 'Content must be at most 500 characters'),
  tag: Yup.string()
    .oneOf(noteTags, 'Choose a valid tag')
    .required('Tag is required'),
});

interface NoteFormProps {
  onCancel: () => void;
}

export default function NoteForm({ onCancel }: NoteFormProps) {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const handleSubmit = async (
    values: NewNote,
    actions: FormikHelpers<NewNote>,
  ) => {
    try {
      await createMutation.mutateAsync(values);
      actions.resetForm();
      onCancel();
    } catch {
      // The mutation error is displayed below the form.
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form className={css.form}>
          <div className={css.formGroup}>
            <label htmlFor="title">Title</label>
            <Field id="title" name="title" type="text" className={css.input} />
            <ErrorMessage name="title" component="span" className={css.error} />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="content">Content</label>
            <Field
              id="content"
              name="content"
              as="textarea"
              rows={8}
              className={css.textarea}
            />
            <ErrorMessage
              name="content"
              component="span"
              className={css.error}
            />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="tag">Tag</label>
            <Field id="tag" name="tag" as="select" className={css.select}>
              {noteTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </Field>
            <ErrorMessage name="tag" component="span" className={css.error} />
          </div>

          <div className={css.actions}>
            <button
              type="button"
              className={css.cancelButton}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={css.submitButton}
              disabled={isSubmitting || createMutation.isPending}
            >
              {isSubmitting || createMutation.isPending
                ? 'Creating...'
                : 'Create note'}
            </button>
          </div>
          {createMutation.isError && (
            <p role="alert" className={css.error}>
              Unable to create the note. Please try again.
            </p>
          )}
        </Form>
      )}
    </Formik>
  );
}
