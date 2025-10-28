'use client';

import { useEffect, useState, useRef } from 'react';
import { EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Youtube from '@tiptap/extension-youtube';
import Toolbar from './Toolbar';

interface TiptapProps {
  content: string; // Used for INITIAL content
  onChange: (richText: string) => void;
}

const TiptapEditor = ({ content, onChange }: TiptapProps) => {
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const isMounted = useRef(false);
  const initialContentSet = useRef(false); // Ref to track if content was set

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (typeof window === 'undefined' || isMounted.current || editorRef.current) {
      return;
    }
    isMounted.current = true;

    const editor = new Editor({
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
          // Underline is enabled by default
          // Now, add your custom Link configuration here:
          link: {
            openOnClick: false,
            autolink: true,
            HTMLAttributes: {
              rel: 'noopener noreferrer nofollow',
              target: '_blank',
            },
          },
        }),
        Image.configure({ inline: false }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Highlight.configure({ multicolor: true }),
        Subscript,
        Superscript,
        Youtube.configure({ controls: true }),
      ],
      content: content || '',
      editorProps: {
        attributes: {
          // --- START FIX: Removed conflicting bg-white, dark:bg-gray-700, text-black, and dark:text-white ---
          // The prose classes and the parent div will handle all colors.
          class:
            'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl dark:prose-invert focus:outline-none p-4 min-h-[300px] w-full',
          // --- END FIX ---
        },
      },
      onUpdate({ editor }) {
        onChangeRef.current(editor.getHTML());
      },
    });

    editorRef.current = editor;
    setEditorInstance(editor);

    if (content) {
      initialContentSet.current = true;
    }

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
      isMounted.current = false;
      initialContentSet.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initialize strictly ONCE

  // --- Effect to load fetched content AFTER editor initializes ---
  useEffect(() => {
    if (
      editorRef.current &&
      content &&
      !initialContentSet.current &&
      content !== editorRef.current.getHTML()
    ) {
      editorRef.current.commands.setContent(content, { emitUpdate: false });
      initialContentSet.current = true;
    }
    // This else-if block is likely unnecessary for the edit page
    // else if (editorRef.current && !content && initialContentSet.current && editorRef.current.getHTML() !== '<p></p>') {
    //   editorRef.current.commands.clearContent(false);
    // }
  }, [content]); // Run whenever the 'content' prop changes

  if (!editorInstance) {
    return (
      <div className="flex flex-col border border-gray-300 dark:border-gray-700 rounded-lg">
        <div className="flex flex-wrap items-center gap-2 p-2 border-b border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 rounded-t-lg min-h-[44px]"></div>
        <div className="p-4 border-t-0 border-gray-300 dark:border-gray-700 rounded-b-md min-h-[300px] bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-500 italic">
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
      <Toolbar editor={editorInstance} />
      <div className="flex-grow border-t border-gray-300 dark:border-gray-700">
        <EditorContent editor={editorInstance} className="h-full" />
      </div>
    </div>
  );
};

export default TiptapEditor;

