'use client';

import { Editor } from '@tiptap/react';
import React from 'react';
import {
  Bold, Strikethrough, Italic, List, ListOrdered, Heading1, Heading2, Heading3,
  Code, Quote, Undo, Redo, Image as ImageIcon, Video as VideoIcon,
  Underline as UnderlineIcon, Link as LinkIcon, Link2Off,
  AlignCenter, AlignLeft, AlignRight, AlignJustify,
  Highlighter,
  Subscript as SubscriptIcon, Superscript as SuperscriptIcon,
  Minus as HorizontalRuleIcon,
  RemoveFormatting
} from 'lucide-react';

type Props = {
  editor: Editor | null;
};

// ... (ToolbarButton component remains the same) ...
const ToolbarButton = ({
  onClick,
  isActive,
  isDisabled = false,
  children,
  label,
}: {
  onClick: () => void;
  isActive: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isDisabled}
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

  // --- Add Image Handler ---
  const addImage = () => {
    const url = window.prompt('Enter Image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

   // --- START: Updated Add Video Handler ---
   const addVideo = () => {
     const url = window.prompt('Enter YouTube Video URL:'); // Only ask for YouTube URL
     if (url) {
        // Use the dedicated YouTube extension command
        // This command will parse the URL and insert the embed correctly
        editor.chain().focus().setYoutubeVideo({
            src: url,
            // You can set width/height here if you want
            // width: 640, 
            // height: 480,
        }).run();
     }
   };
   // --- END: Updated Add Video Handler ---
   
  const setLink = () => {
    // ... (logic remains the same)
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter Link URL:', previousUrl || '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 md:gap-2 p-2 border-b border-gray-300 bg-gray-50 rounded-t-lg">
      {/* ... (All other buttons remain the same) ... */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} label="Bold" isDisabled={!editor.can().toggleBold()}> <Bold className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} label="Italic" isDisabled={!editor.can().toggleItalic()}> <Italic className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} label="Underline" isDisabled={!editor.can().toggleUnderline()}> <UnderlineIcon className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} label="Strikethrough" isDisabled={!editor.can().toggleStrike()}> <Strikethrough className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} label="Highlight" isDisabled={!editor.can().toggleHighlight()}> <Highlighter className="h-4 w-4" /> </ToolbarButton>
       <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} isActive={editor.isActive('subscript')} label="Subscript" isDisabled={!editor.can().toggleSubscript()}> <SubscriptIcon className="h-4 w-4" /> </ToolbarButton>
       <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} isActive={editor.isActive('superscript')} label="Superscript" isDisabled={!editor.can().toggleSuperscript()}> <SuperscriptIcon className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} label="Set Link" isDisabled={!editor.can().setLink({href:''})}> <LinkIcon className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} isActive={false} label="Unset Link" isDisabled={!editor.isActive('link')}> <Link2Off className="h-4 w-4" /> </ToolbarButton>
      <div className="w-[1px] h-6 bg-gray-300 mx-1 hidden md:block"></div>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} label="Heading 1"> <Heading1 className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} label="Heading 2"> <Heading2 className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} label="Heading 3"> <Heading3 className="h-4 w-4" /> </ToolbarButton>
       <div className="w-[1px] h-6 bg-gray-300 mx-1 hidden md:block"></div>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} label="Bullet List" isDisabled={!editor.can().toggleBulletList()}> <List className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} label="Ordered List" isDisabled={!editor.can().toggleOrderedList()}> <ListOrdered className="h-4 w-4" /> </ToolbarButton>
      <div className="w-[1px] h-6 bg-gray-300 mx-1 hidden md:block"></div>
       <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} label="Align Left" isDisabled={!editor.can().setTextAlign('left')}> <AlignLeft className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} label="Align Center" isDisabled={!editor.can().setTextAlign('center')}> <AlignCenter className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} label="Align Right" isDisabled={!editor.can().setTextAlign('right')}> <AlignRight className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} label="Align Justify" isDisabled={!editor.can().setTextAlign('justify')}> <AlignJustify className="h-4 w-4" /> </ToolbarButton>
      <div className="w-[1px] h-6 bg-gray-300 mx-1 hidden md:block"></div>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} label="Blockquote" isDisabled={!editor.can().toggleBlockquote()}> <Quote className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} label="Code Block" isDisabled={!editor.can().toggleCodeBlock()}> <Code className="h-4 w-4" /> </ToolbarButton>
       <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} isActive={false} label="Horizontal Rule" isDisabled={!editor.can().setHorizontalRule()}> <HorizontalRuleIcon className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={addImage} isActive={false} label="Add Image"> <ImageIcon className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={addVideo} isActive={false} label="Embed Video"> <VideoIcon className="h-4 w-4" /> </ToolbarButton>
       <div className="w-[1px] h-6 bg-gray-300 mx-1 hidden md:block"></div>
       <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} isActive={false} label="Clear Formatting"> <RemoveFormatting className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} isActive={false} label="Undo" isDisabled={!editor.can().undo()}> <Undo className="h-4 w-4" /> </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} isActive={false} label="Redo" isDisabled={!editor.can().redo()}> <Redo className="h-4 w-4" /> </ToolbarButton>
    </div>
  );
}

