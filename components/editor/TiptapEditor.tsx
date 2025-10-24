'use client';

import { useEffect, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image'; // 1. Import the Image extension
import Toolbar from './Toolbar';

interface TiptapProps {
  content: string;
  onChange: (richText: string) => void;
}

const TiptapEditor = ({ content, onChange }: TiptapProps) => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const editorInstance = new Editor({
      extensions: [
        StarterKit.configure({
          // Ensure heading levels match toolbar if configured
           heading: { levels: [1, 2, 3] }
        }),
        Image.configure({ // 2. Add the Image extension
          inline: false, // Allows images to be on their own line
          // You can add more configurations here if needed
          // e.g., allowBase64: true, HTMLAttributes: { class: 'my-custom-image-class' }
        }),
      ],
      content: content,
      editorProps: {
        attributes: {
          class:
             // Adjusted prose classes for better image handling potentially
            'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl dark:prose-invert focus:outline-none p-4 border-t-0 border border-gray-300 rounded-b-md min-h-[300px] bg-white text-black w-full',
        },
      },
      onUpdate({ editor }) {
        onChange(editor.getHTML());
        console.log(editor.getHTML());
      },
    });

    setEditor(editorInstance);
    setIsMounted(true);

    return () => {
      editorInstance.destroy();
      setIsMounted(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]); // Keep dependency array minimal


  if (!isMounted || !editor) {
      // ... (Loading state remains the same) ...
        return (
        <div className="flex flex-col border border-gray-300 rounded-lg">
            <div className="flex flex-wrap items-center gap-2 p-2 border-b border-gray-300 bg-gray-100 rounded-t-lg min-h-[44px]">
                 {/* Placeholder */}
            </div>
            <div className="p-4 border-t-0 border border-gray-300 rounded-b-md min-h-[300px] bg-white text-gray-400 italic">
                Loading editor...
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col border border-gray-300 rounded-lg">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;