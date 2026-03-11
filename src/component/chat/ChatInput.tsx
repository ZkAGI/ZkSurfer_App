'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { LuPaperclip, LuSend, LuX, LuFileText, LuImage as LuImageIcon, LuVideo, LuMusic } from 'react-icons/lu';

interface FileObject {
  file: File;
  preview: string;
  isPdf: boolean;
  isVideoOrAudio?: boolean;
}

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  files: FileObject[];
  onFileAdd: (files: FileList) => void;
  onFileRemove: (index: number) => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  showCommandPrefix?: boolean;
  isMobile?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  files,
  onFileAdd,
  onFileRemove,
  isDisabled = false,
  isLoading = false,
  placeholder = 'Message ZkTerminal...',
  showCommandPrefix = false,
  isMobile = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '40px';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [value]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      onFileAdd(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileAdd(e.target.files);
    }
  };

  const getFileIcon = (file: FileObject) => {
    if (file.isPdf) return <LuFileText className="w-4 h-4 text-red-400" />;
    if (file.file.type.startsWith('video/')) return <LuVideo className="w-4 h-4 text-blue-400" />;
    if (file.file.type.startsWith('audio/')) return <LuMusic className="w-4 h-4 text-purple-400" />;
    if (file.file.type.startsWith('image/')) return <LuImageIcon className="w-4 h-4 text-green-400" />;
    return <LuFileText className="w-4 h-4 text-gray-400" />;
  };

  const isCommand = value.startsWith('/');

  return (
    <div
      className={`sticky bottom-0 bg-gradient-to-t from-[#000] via-[#000]/95 to-transparent
                  pt-6 pb-4 px-4 ${isMobile ? 'pb-safe' : ''}`}
    >
      <div className="max-w-4xl mx-auto">
        {/* File Preview Row */}
        {files.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap animate-fadeIn">
            {files.map((file, index) => (
              <div
                key={index}
                className="relative group flex items-center gap-2 px-3 py-2 bg-[#0A1426]
                           border border-[#1E2A45] rounded-lg"
              >
                {file.isPdf || file.isVideoOrAudio ? (
                  <div className="flex items-center gap-2">
                    {getFileIcon(file)}
                    <span className="text-xs text-white truncate max-w-[100px]">
                      {file.file.name}
                    </span>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-md overflow-hidden">
                    <img
                      src={file.preview}
                      alt={`Preview ${index}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <button
                  onClick={() => onFileRemove(index)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full
                             flex items-center justify-center opacity-0 group-hover:opacity-100
                             transition-opacity"
                >
                  <LuX className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main Input Container */}
        <form onSubmit={onSubmit}>
          <div
            className={`terminal-input relative ${isDragOver ? 'border-zkPurple/50 bg-zkPurple/5' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Command Prefix */}
            {isCommand && showCommandPrefix && (
              <span className="absolute left-4 top-1/2 -translate-y-1/2 command-prefix text-lg">
                $
              </span>
            )}

            <textarea
              ref={textareaRef}
              value={value}
              onChange={onChange}
              onKeyDown={(e) => {
                // Handle Enter key for desktop
                if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
                  if (value.trim()) {
                    e.preventDefault();
                    onSubmit(e);
                  } else {
                    e.preventDefault();
                  }
                }
                onKeyDown?.(e);
              }}
              placeholder={placeholder}
              disabled={isDisabled}
              className={`w-full bg-transparent py-4 px-4 pr-24 resize-none
                         text-white placeholder:text-zkDarkPurple
                         focus:outline-none font-sourceCode text-sm
                         ${isCommand && showCommandPrefix ? 'pl-8' : ''}
                         ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                minHeight: '40px',
                maxHeight: '150px',
              }}
            />

            {/* Action Buttons */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {/* Attach Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isDisabled}
                className="p-2 text-zkDarkPurple hover:text-white transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LuPaperclip className="w-5 h-5" />
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={isDisabled || isLoading || !value.trim()}
                className="p-2 bg-zkPurple rounded-lg text-white
                           hover:bg-zkPurple/80 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <LuSend className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
              accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.txt,.json"
            />
          </div>
        </form>

        {/* Keyboard Hint */}
        {!isMobile && (
          <div className="text-center mt-3 text-xs text-zkDarkPurple">
            Press <kbd className="kbd-hint">Enter</kbd> to send,{' '}
            <kbd className="kbd-hint">Shift + Enter</kbd> for new line
          </div>
        )}

        {/* Drag overlay message */}
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#000]/80
                          rounded-2xl border-2 border-dashed border-zkPurple pointer-events-none">
            <p className="text-zkPurple font-medium">Drop files here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
