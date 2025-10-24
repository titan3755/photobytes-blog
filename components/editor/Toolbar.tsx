'use client';

import { Editor } from '@tiptap/react';
import React from 'react';
import {
  Bold,
  Strikethrough,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  Undo,
  Redo,
} from 'lucide-react'; // Using lucide-react for icons

type Props = {
  editor: Editor | null;
};

// Reusable Button Component
const ToolbarButton = ({
  onClick,
  isActive,
  children,
  label,
}: {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  label: string;
}) => (
  <button
    type="button" // Important to prevent form submission
    onClick={onClick}
    className={`p-2 rounded hover:bg-gray-200 ${
      isActive ? 'bg-gray-300 text-black' : 'text-gray-600'
    }`}
    aria-label={label}
    title={label} // Tooltip
  >
    {children}
  </button>
);

export default function Toolbar({ editor }: Props) {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border-b border-gray-300 bg-gray-50 rounded-t-lg">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        label="Bold"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        label="Italic"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        label="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>

      {/* Separator */}
      <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        label="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
       <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        label="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
       <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        label="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      {/* Separator */}
      <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>

       <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        label="Bullet List"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
       <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        label="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
        <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        label="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
         <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        label="Code Block"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

       {/* Separator */}
      <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>

       <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        isActive={false} // Undo/Redo don't have active states
        label="Undo"
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>
        <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        isActive={false}
        label="Redo"
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>

    </div>
  );
}