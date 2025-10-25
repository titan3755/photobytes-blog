'use client';

import { useEffect, useState, useRef } from 'react';
import { EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
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
          // --- FIX: Removed horizontalRule: true ---
          // It is included by default in StarterKit
        }),
        Image.configure({ inline: false }),
        Underline,
        Link.configure({
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            rel: 'noopener noreferrer nofollow',
            target: '_blank',
          },
        }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Highlight.configure({ multicolor: true }),
        Subscript,
        Superscript,
        Youtube.configure({ controls: true }), // Add Youtube here
      ],
      content: content || '', // Use initial content or empty string
      editorProps: {
        attributes: {
          class:
            'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none p-4 min-h-[300px] w-full !text-black bg-white',
        },
      },
      onUpdate({ editor }) {
        onChangeRef.current(editor.getHTML());
      },
    });

    editorRef.current = editor;
    setEditorInstance(editor);

    if (content) {
      // If initial content exists (like on edit page)
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
      // This block runs when content is fetched asynchronously (e.g., on edit page)
      editorRef.current.commands.setContent(content, { emitUpdate: false });
      initialContentSet.current = true;
    }
  }, [content]); // Run whenever the 'content' prop changes

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

  return (
    <div className="flex flex-col border border-gray-300 rounded-lg bg-white overflow-hidden">
      <Toolbar editor={editorInstance} />
      <div className="flex-grow border-t border-gray-300">
        <EditorContent editor={editorInstance} className="h-full" />
      </div>
    </div>
  );
};

export default TiptapEditor;