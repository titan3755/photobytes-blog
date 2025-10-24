'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Toolbar from './Toolbar'; // We'll create this next

// Define the props for your TiptapEditor component
interface TiptapProps {
  content: string;
  onChange: (richText: string) => void; // Callback to update parent state
}

const TiptapEditor = ({ content, onChange }: TiptapProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
         // You can configure the StarterKit here if needed
         // heading: { levels: [1, 2, 3] } // Example: Only allow H1, H2, H3
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        // Add Tailwind classes for styling the editor area
        class:
          'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none p-4 border border-gray-300 rounded-md min-h-[300px] bg-white text-black',
      },
    },
    // Update the parent component's state when content changes
    onUpdate({ editor }) {
      onChange(editor.getHTML());
      console.log(editor.getHTML()); // Log HTML on change
    },
  });

  if (!editor) {
    return null; // Or return a loading indicator
  }

  return (
    <div className="flex flex-col border border-gray-300 rounded-lg">
      <Toolbar editor={editor} /> {/* Render the toolbar */}
      <EditorContent editor={editor} /> {/* Render the editor content area */}
    </div>
  );
};

export default TiptapEditor;