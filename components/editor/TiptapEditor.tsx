'use client';

import { useEffect, useState, useRef } from 'react';
import { EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
// --- START: Import New Extensions ---
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
// HorizontalRule is in StarterKit
// --- END: Import New Extensions ---
import Toolbar from './Toolbar';

interface TiptapProps {
  content: string; // Used for INITIAL content
  onChange: (richText: string) => void;
}

const TiptapEditor = ({ content, onChange }: TiptapProps) => {
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const isMounted = useRef(false);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // --- STRICTLY ONE-TIME Initialization Effect ---
  useEffect(() => {
    if (typeof window === 'undefined' || isMounted.current || editorRef.current) {
      return;
    }
    isMounted.current = true;

    const editor = new Editor({
      extensions: [
        StarterKit.configure({
           heading: { levels: [1, 2, 3] },
           // HorizontalRule is included here
        }),
        Image.configure({ inline: false }),
        // --- START: Add New Extensions ---
        Underline,
        Link.configure({
            openOnClick: false, // Don't open link when clicking in editor
            autolink: true, // Automatically detect links
            // Add rel="noopener noreferrer nofollow" to links for security/SEO
            HTMLAttributes: {
                rel: 'noopener noreferrer nofollow',
                target: '_blank', // Always open links in new tab
            },
        }),
        TextAlign.configure({
            types: ['heading', 'paragraph'], // Allow alignment on these node types
        }),
        Highlight.configure({ multicolor: true }), // Allow different highlight colors (though toolbar only uses default for now)
        Subscript,
        Superscript,
        // --- END: Add New Extensions ---
      ],
      content: content, // Set initial content ONCE
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

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initialize strictly ONCE

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

  // Simplified container, styling inside editor
  return (
    <div className="flex flex-col border border-gray-300 rounded-lg bg-white overflow-hidden">
      <Toolbar editor={editorInstance} />
      {/* Container for EditorContent */}
      <div className="flex-grow border-t border-gray-300">
        <EditorContent editor={editorInstance} className="h-full" />
      </div>
    </div>
  );
};

export default TiptapEditor;

