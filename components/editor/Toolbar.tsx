'use client';

import { Editor } from '@tiptap/react';
import React from 'react';
import {
  Bold, Strikethrough, Italic, List, ListOrdered, Heading1, Heading2, Heading3,
  Code, Quote, Undo, Redo, Image as ImageIcon, Video as VideoIcon,
  // --- START: Import New Icons ---
  Underline as UnderlineIcon, Link as LinkIcon, Link2Off, // Link icons
  AlignCenter, AlignLeft, AlignRight, AlignJustify, // Alignment icons
  Highlighter, // Highlight icon
  Subscript as SubscriptIcon, Superscript as SuperscriptIcon, // Sub/Superscript icons
  Minus as HorizontalRuleIcon, // Horizontal Rule icon
  RemoveFormatting // Clear Formatting icon
  // --- END: Import New Icons ---
} from 'lucide-react';

type Props = {
  editor: Editor | null;
};

// Reusable Button Component
const ToolbarButton = ({
  onClick,
  isActive,
  isDisabled = false, // Add isDisabled prop
  children,
  label,
}: {
  onClick: () => void;
  isActive: boolean;
  isDisabled?: boolean; // Optional
  children: React.ReactNode;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isDisabled} // Use isDisabled prop
    className={`p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ${
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

  // --- Handlers for New Buttons ---

  const addImage = () => { /* ... (remains the same) ... */
     const url = window.prompt('Enter Image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
   };
  const addVideo = () => { /* ... (remains the same) ... */
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
                 `<div style="position: relative; padding-bottom: 56.25%; height: 0;"><iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div><p></p>` + editor.getHTML(),
                 { parseOptions: { preserveWhitespace: false } }
             ).run();
        } else {
            alert('Please enter a valid YouTube or Vimeo URL.');
        }
     }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter Link URL:', previousUrl || '');

    // cancelled
    if (url === null) {
      return;
    }

    // empty url - remove link
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  // --- End Handlers ---


  return (
    <div className="flex flex-wrap items-center gap-1 md:gap-2 p-2 border-b border-gray-300 bg-gray-50 rounded-t-lg"> {/* Reduced gap */}
      {/* --- Standard Formatting --- */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} label="Bold" isDisabled={!editor.can().toggleBold()}> <Bold className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} label="Italic" isDisabled={!editor.can().toggleItalic()}> <Italic className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} label="Underline" isDisabled={!editor.can().toggleUnderline()}> <UnderlineIcon className="h-4 w-4" /> </ToolbarButton> {/* Added Underline */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} label="Strikethrough" isDisabled={!editor.can().toggleStrike()}> <Strikethrough className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} label="Highlight" isDisabled={!editor.can().toggleHighlight()}> <Highlighter className="h-4 w-4" /> </ToolbarButton> {/* Added Highlight */}

      {/* --- Sub/Superscript --- */}
       <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} isActive={editor.isActive('subscript')} label="Subscript" isDisabled={!editor.can().toggleSubscript()}> <SubscriptIcon className="h-4 w-4" /> </ToolbarButton> {/* Added Subscript */}
       <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} isActive={editor.isActive('superscript')} label="Superscript" isDisabled={!editor.can().toggleSuperscript()}> <SuperscriptIcon className="h-4 w-4" /> </ToolbarButton> {/* Added Superscript */}

      {/* --- Links --- */}
      <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} label="Set Link" isDisabled={!editor.can().setLink({href:''})}> <LinkIcon className="h-4 w-4" /> </ToolbarButton> {/* Added Link */}
      <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} isActive={false} label="Unset Link" isDisabled={!editor.isActive('link')}> <Link2Off className="h-4 w-4" /> </ToolbarButton> {/* Added Unlink */}


      {/* Separator */} <div className="w-[1px] h-6 bg-gray-300 mx-1 hidden md:block"></div>

      {/* --- Headings --- */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} label="Heading 1"> <Heading1 className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} label="Heading 2"> <Heading2 className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} label="Heading 3"> <Heading3 className="h-4 w-4" /> </ToolbarButton>

       {/* Separator */} <div className="w-[1px] h-6 bg-gray-300 mx-1 hidden md:block"></div>

      {/* --- Lists --- */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} label="Bullet List" isDisabled={!editor.can().toggleBulletList()}> <List className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} label="Ordered List" isDisabled={!editor.can().toggleOrderedList()}> <ListOrdered className="h-4 w-4" /> </ToolbarButton>

      {/* Separator */} <div className="w-[1px] h-6 bg-gray-300 mx-1 hidden md:block"></div>

       {/* --- Alignment --- */}
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} label="Align Left" isDisabled={!editor.can().setTextAlign('left')}> <AlignLeft className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} label="Align Center" isDisabled={!editor.can().setTextAlign('center')}> <AlignCenter className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} label="Align Right" isDisabled={!editor.can().setTextAlign('right')}> <AlignRight className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} label="Align Justify" isDisabled={!editor.can().setTextAlign('justify')}> <AlignJustify className="h-4 w-4" /> </ToolbarButton>


      {/* Separator */} <div className="w-[1px] h-6 bg-gray-300 mx-1 hidden md:block"></div>

      {/* --- Block Elements --- */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} label="Blockquote" isDisabled={!editor.can().toggleBlockquote()}> <Quote className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} label="Code Block" isDisabled={!editor.can().toggleCodeBlock()}> <Code className="h-4 w-4" /> </ToolbarButton>
       <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} isActive={false} label="Horizontal Rule" isDisabled={!editor.can().setHorizontalRule()}> <HorizontalRuleIcon className="h-4 w-4" /> </ToolbarButton> {/* Added Horizontal Rule */}

      {/* --- Media --- */}
      <ToolbarButton onClick={addImage} isActive={false} label="Add Image"> <ImageIcon className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={addVideo} isActive={false} label="Embed Video (YouTube/Vimeo)"> <VideoIcon className="h-4 w-4" /> </ToolbarButton>

       {/* Separator */} <div className="w-[1px] h-6 bg-gray-300 mx-1 hidden md:block"></div>

       {/* --- Clear Formatting & History --- */}
       <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} isActive={false} label="Clear Formatting"> <RemoveFormatting className="h-4 w-4" /> </ToolbarButton> {/* Added Clear Formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} isActive={false} label="Undo" isDisabled={!editor.can().undo()}> <Undo className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} isActive={false} label="Redo" isDisabled={!editor.can().redo()}> <Redo className="h-4 w-4" /> </ToolbarButton>
    </div>
  );
}

