'use client';

import { useEffect, useState, useRef } from 'react';
import { EditorContent, Editor } from '@tiptap/react'; // Removed useEditor, we create instance manually
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Toolbar from './Toolbar';

interface TiptapProps {
  content: string; // Used for INITIAL content
  onChange: (richText: string) => void;
}

const TiptapEditor = ({ content, onChange }: TiptapProps) => {
  // Use state ONLY for triggering re-render once editor is ready
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const editorRef = useRef<Editor | null>(null); // Ref to hold the stable instance
  const isMounted = useRef(false); // Ref to track mount status

  // Store onChange in a ref to avoid dependency issues
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // --- STRICTLY ONE-TIME Initialization Effect ---
  useEffect(() => {
    // Prevent running on server or multiple times
    if (typeof window === 'undefined' || isMounted.current || editorRef.current) {
      return;
    }

    isMounted.current = true; // Mark as mounted

    const editor = new Editor({
      extensions: [
        StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
        Image.configure({ inline: false }),
      ],
      content: content, // Set initial content ONCE
      editorProps: {
        attributes: {
          class:
            'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl dark:prose-invert focus:outline-none p-4 min-h-[300px] w-full text-black bg-white',
        },
      },
      onUpdate({ editor }) {
        onChangeRef.current(editor.getHTML());
      },
    });

    editorRef.current = editor; // Store in ref
    setEditorInstance(editor); // Set state to trigger re-render with the editor

    // Cleanup function
    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
      isMounted.current = false; // Reset mount status on unmount
      setEditorInstance(null); // Clear state
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]); // Depend only on initial content

  // --- Separate effect to handle external content updates (for edit page) ---
  useEffect(() => {
      // If editor exists, is mounted, and content prop differs from editor content
      if (editorRef.current && isMounted.current && content !== editorRef.current.getHTML()) {
           // Check if the change wasn't triggered internally
           // This prevents resetting content/cursor during typing
          const { from, to } = editorRef.current.state.selection;
          // --- FIX: Use options object instead of boolean ---
          editorRef.current.commands.setContent(content, { emitUpdate: false }); // Update content without firing 'onUpdate'
          // --- END FIX ---
          // Attempt to restore selection, might be imperfect
          editorRef.current.commands.setTextSelection({ from, to });

      }
  }, [content]); // Depend only on the content prop


  // Show placeholder while the editor instance is not ready
  if (!editorInstance) {
    return (
      <div className="flex flex-col border border-gray-300 rounded-lg">
        <div className="flex flex-wrap items-center gap-2 p-2 border-b border-gray-300 bg-gray-100 rounded-t-lg min-h-[44px]"></div>
        <div className="p-4 border-t-0 border border-gray-300 rounded-b-md min-h-[300px] bg-white text-gray-400 italic">
          Loading editor...
        </div>
      </div>
    );
  }

  // Render the editor once the instance is ready
  return (
    <div className="flex flex-col border border-gray-300 rounded-lg bg-white">
      <Toolbar editor={editorInstance} />
      <div className="flex-grow border-t border-gray-300">
        <EditorContent editor={editorInstance} className="h-full" />
      </div>
    </div>
  );
};

export default TiptapEditor;