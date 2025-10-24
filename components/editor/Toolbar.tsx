'use client';

import { Editor } from '@tiptap/react';
import React from 'react';
import {
  Bold, Strikethrough, Italic, List, ListOrdered, Heading1, Heading2, Heading3,
  Code, Quote, Undo, Redo, Image as ImageIcon, Video as VideoIcon
} from 'lucide-react';

type Props = {
  editor: Editor | null;
};

// Removed the duplicate definition here
// const ToolbarButton = ({ /* ... */ }) => ( /* ... */ );

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
    type="button"
    onClick={onClick}
    className={`p-2 rounded hover:bg-gray-200 ${
      isActive ? 'bg-gray-300 text-black' : 'text-gray-600'
    }`}
    aria-label={label}
    title={label}
  >
    {children}
  </button>
);


export default function Toolbar({ editor }: Props) {
  if (!editor) {
    return null;
  }

  // --- Add Image Handler ---
  const addImage = () => {
    const url = window.prompt('Enter Image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

   // --- Add Video Handler (using iframe for YouTube/Vimeo) ---
   const addVideo = () => {
     const url = window.prompt('Enter YouTube or Vimeo Video URL:');
     if (url) {
        let embedUrl = '';
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
            if(videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (url.includes('vimeo.com')) {
             const videoId = url.split('/').pop()?.split('?')[0];
             if(videoId) embedUrl = `https://player.vimeo.com/video/${videoId}`;
        }

        if (embedUrl) {
             editor.chain().focus().setContent(
                 // Added relative and padding-bottom for aspect ratio
                 `<div style="position: relative; padding-bottom: 56.25%; height: 0;"><iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div><p></p>` + editor.getHTML(), // Added <p></p> for spacing
                 { parseOptions: { preserveWhitespace: false } }
             ).run();
        } else {
            alert('Please enter a valid YouTube or Vimeo URL.');
        }
     }
   };


  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border-b border-gray-300 bg-gray-50 rounded-t-lg">
      {/* --- Buttons remain the same --- */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} label="Bold"> <Bold className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} label="Italic"> <Italic className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} label="Strikethrough"> <Strikethrough className="h-4 w-4" /> </ToolbarButton>
      <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} label="Heading 1"> <Heading1 className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} label="Heading 2"> <Heading2 className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} label="Heading 3"> <Heading3 className="h-4 w-4" /> </ToolbarButton>
      <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} label="Bullet List"> <List className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} label="Ordered List"> <ListOrdered className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} label="Blockquote"> <Quote className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} label="Code Block"> <Code className="h-4 w-4" /> </ToolbarButton>

      <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>
       <ToolbarButton
        onClick={addImage}
        isActive={false}
        label="Add Image"
      >
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={addVideo}
        isActive={false}
        label="Embed Video (YouTube/Vimeo)"
      >
        <VideoIcon className="h-4 w-4" />
      </ToolbarButton>


      <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} isActive={false} label="Undo"> <Undo className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} isActive={false} label="Redo"> <Redo className="h-4 w-4" /> </ToolbarButton>
    </div>
  );
}