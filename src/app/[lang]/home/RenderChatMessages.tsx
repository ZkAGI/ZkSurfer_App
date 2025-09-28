import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import ResultBlock from "@/component/ui/ResultBlock"; // Import the ResultBlock component
import { Message } from "./HomeContent";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { PencilIcon, CheckIcon, XIcon } from "lucide-react";

interface RenderChatMessagesProps {
  displayMessages: Array<Message>;
  isLoading: boolean;
  processingCommand: boolean;
  handleMintNFT: (base64Image: string) => Promise<void>; // Updated to accept a parameter
  handleDownload: () => void;
  renderMessageContent: (
    message: Message
  ) => JSX.Element | JSX.Element[] | null; // Updated to accept array
  imageResultType: string | null;
  handleLaunchMemeCoin: () => void;
  isMobile: boolean;
  onAddTestMessage?: (message: Message) => void; // Optional test function
  mockMode?: boolean; // Mock mode state
  onToggleMockMode?: () => void; // Toggle mock mode function
  onEditMessage?: (index: number, newContent: string) => void; // Edit message handler
}

const RenderChatMessages: React.FC<RenderChatMessagesProps> = ({
  displayMessages,
  isLoading,
  processingCommand,
  handleMintNFT,
  handleDownload,
  renderMessageContent,
  imageResultType,
  handleLaunchMemeCoin,
  isMobile,
  onAddTestMessage,
  mockMode,
  onToggleMockMode,
  onEditMessage,
}) => {
  const LONG_TEXT_THRESHOLD = 200;
  const [expandedByIndex, setExpandedByIndex] = useState<Record<number, boolean>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>("");


  const toggleExpanded = (idx: number) => {
    setExpandedByIndex((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleShare = async () => {
    try {
      const shareUrl = typeof window !== "undefined" ? window.location.href : "";
      if (navigator.share) {
        await navigator.share({ title: "ZkTerminal", text: "Check this out", url: shareUrl });
      } else if (navigator.clipboard && shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch (_) {
      // ignore share/clipboard errors
    }
  };

  const handleEdit = (messageIndex: number) => {
    const messageToEdit = displayMessages[messageIndex];
    if (messageToEdit && messageToEdit.role === "user") {
      setEditingIndex(messageIndex);
      setEditContent(typeof messageToEdit.content === "string" ? messageToEdit.content : "");
    }
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editContent.trim()) {
      try {
        // If onEditMessage prop is provided, use it
        if (onEditMessage) {
          onEditMessage(editingIndex, editContent.trim());
        } else {
          // Fallback: just log the edit (for development/testing)
          console.log(`Editing message ${editingIndex}:`, editContent.trim());
        }
        
        // Clear edit state
        setEditingIndex(null);
        setEditContent("");
      } catch (error) {
        console.error("Error saving edit:", error);
        // Keep edit mode open if there's an error
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div>
      {/* Test buttons for development */}
      {process.env.NODE_ENV === 'development' && onAddTestMessage && (
        <div className="mb-4 p-2 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-400 mb-2">Test Assistant Right Alignment:</p>
          <div className="flex gap-2 flex-wrap mb-2">
            <button
              onClick={onToggleMockMode}
              className={`px-3 py-1 rounded text-sm font-medium ${
                mockMode 
                  ? "bg-green-600 text-white hover:bg-green-700" 
                  : "bg-gray-600 text-white hover:bg-gray-700"
              }`}
            >
              {mockMode ? "🟢 Mock Mode ON" : "⚪ Mock Mode OFF"}
            </button>
            <span className="text-xs text-gray-500 self-center">
              {mockMode ? "Type any message to get mock responses" : "Enable to test without API"}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onAddTestMessage({
                role: "assistant",
                content: "MOCK_IMAGE",
                command: "image-gen"
              })}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Test Image (Right)
            </button>
            <button
              onClick={() => onAddTestMessage({
                role: "assistant",
                content: "This is a long test assistant message intended to verify right alignment, the avatar placement on the right, and the new collapsible show more/less behavior for lengthy content. It includes multiple sentences and repeated phrases so that it clearly exceeds the truncation threshold. When collapsed, the bottom gradient fade should appear, and when expanded, the entire message should become visible without any clipping. The purpose of this message is purely for UI testing in development mode. If this message is still not long enough, we will extend it further by adding additional explanatory text. ZkTerminal should display the name above, with action buttons below it, while this content area remains clean and readable. Here is some more filler text to ensure we cross the 400 character limit: lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum convallis, arcu sed aliquet fermentum, urna sapien scelerisque tortor, vitae tempor arcu lorem a ligula. Aliquam erat volutpat. Integer nec dui id leo gravida gravida. Sed iaculis, mauris ac feugiat fermentum, justo nisl convallis lorem, vel condimentum lorem nunc vitae erat. Ut id consequat augue. Donec hendrerit, justo in faucibus faucibus, risus libero dapibus magna, eu gravida mi neque nec libero. Cras ut nisl sed metus ultricies tempus."
              })}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Test Text (Right)
            </button>
            <button
              onClick={() => onAddTestMessage({
                role: "user",
                content: "This is a test user message to verify left alignment with the U avatar."
              })}
              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
            >
              Test User (Left)
            </button>
            <button
              onClick={() => {
                // Add user message
                onAddTestMessage({
                  role: "user",
                  content: "Hello, can you help me create an image?"
                });
                // Add assistant response after a short delay
                setTimeout(() => {
                  onAddTestMessage({
                    role: "assistant",
                    content: "MOCK_IMAGE",
                    command: "image-gen"
                  });
                }, 1000);
              }}
              className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
            >
              Test Full Conversation
            </button>
          </div>
        </div>
      )}
      
      {/* Render chat messages */}
      {displayMessages.map((message: Message, index) => (
        <div key={index} className={`mb-4 flex w-full ${message.role === "assistant" ? "justify-end" : "justify-start"}`}>
          <div className={`mb-4 flex group relative ${message.role === "assistant" ? "justify-end flex-row-reverse max-w-[80%]" : "justify-start max-w-[80%]"} hover:bg-white/5 hover:rounded-lg transition-all duration-300 p-2 -m-2`}>
            <div className={`flex-shrink-0 ${message.role === "assistant" ? "ml-3" : "mr-3"}`}>
              <div className="w-10 h-10 rounded-full bg-[#171D3D] border flex items-center justify-center">
                {message.role === "user" ? (
                  <span>U</span>
                ) : (
                  <Image
                    src="images/tiger.svg"
                    alt="logo"
                    width={40}
                    height={40}
                    className="p-2"
                  />
                )}
              </div>
            </div>
            <div className={`flex flex-col ${message.role === "assistant" ? "items-end" : "items-start"}`}>
              {/* Name row */}
              <div className={`flex items-center w-full mt-2 ${message.role === "assistant" ? "justify-end" : "justify-start"}`}>
                <span
                  className={`text-md text-gray-400 font-sourceCode ${
                    message.role !== "user" &&
                    "bg-gradient-to-br from-zkIndigo via-zkLightPurple to-zkPurple bg-clip-text text-transparent"
                  } ${!isMobile ? `mt-0.5` : ""} ${message.role === "assistant" ? "text-right" : "text-left"}`}
                >
                  {message.role === "user" ? "User" : "ZkTerminal"}
                </span>
              </div>
              {/* Actions row (hidden until hover) */}
              <div className={`flex gap-3 w-full mb-1.5 ${message.role === "assistant" ? "justify-start" : "justify-end"} opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200`}>
                <button
                  aria-label="Download"
                  title="Download"
                  onClick={handleDownload}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition"
                  type="button"
                >
                  <Image src="images/Download.svg" alt="download" width={20} height={20} />
                </button>
                <button
                  aria-label="Share"
                  title="Share"
                  onClick={handleShare}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition"
                  type="button"
                >
                  <Image src="images/share.svg" alt="share" width={20} height={20} />
                </button>
                 {message.role === "user" && (
                   <button
                     aria-label="Edit"
                     title="Edit"
                     onClick={() => handleEdit(index)}
                     className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition"
                     type="button"
                   >
                     <PencilIcon className="h-4 w-4" />
                   </button>
                 )}
              </div>
              {message.role === "assistant" &&
              typeof message.content === "string" &&
              (message.content.startsWith("data:image") || message.content.includes("MOCK_IMAGE")) ? (
                <div className={message.role === "assistant" ? "ml-auto" : ""}>
                  <ResultBlock
                    content={message.content.includes("MOCK_IMAGE") ? "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDA5ZWUzIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Nb2NrIEltYWdlPC90ZXh0Pgo8L3N2Zz4=" : message.content}
                    type="image"
                    onMintNFT={handleMintNFT}
                    onDownloadProof={handleDownload}
                    imageResultType={message.command}
                    onLaunchMemeCoin={
                      message.command === "create-agent"
                        ? handleLaunchMemeCoin
                        : undefined
                    }
                    loading={isLoading}
                  />
                </div>
              ) : (
                 <div className={`inline-block p-3 rounded-lg ${message.role === "assistant" ? "text-right ml-auto" : "text-left"} ${editingIndex === index ? 'max-w-[90ch]' : 'max-w-[68ch]'} leading-7 text-gray-300 border border-white/10 bg-white/5 transition-all duration-300 overflow-hidden ${editingIndex === index ? 'ring-2 ring-blue-500/20 bg-blue-500/5' : ''}`}>
                   {editingIndex === index && message.role === "user" ? (
                     // Edit mode - Same styling as display mode
                     <>
                      <textarea
                         value={editContent}
                         onChange={(e) => setEditContent(e.target.value)}
                         onKeyDown={handleKeyDown}
                        className="w-full bg-transparent border-0 text-gray-300 resize-none focus:outline-none placeholder-gray-400 leading-7 m-0"
                        rows={1}
                         autoFocus
                         placeholder="Edit your message..."
                         style={{ 
                           minWidth: '300px',
                           minHeight: '80px',
                           width: '100%',
                           boxSizing: 'border-box',
                           padding: '12px 16px',
                           paddingRight: '32px', // Extra space for scrollbar
                           overflowY: 'auto',
                           maxHeight: '60vh'
                         }}
                       />
                       <div className="flex gap-3 mt-4 justify-end">
                         <button
                           onClick={handleSaveEdit}
                           disabled={!editContent.trim()}
                           className={`inline-flex items-center justify-center w-7 h-7 text-white rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                             editContent.trim() 
                               ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                               : 'bg-gray-500 cursor-not-allowed opacity-50'
                           }`}
                           type="button"
                           title={editContent.trim() ? "Save changes (Enter)" : "Enter some text to save"}
                         >
                           <CheckIcon className="h-4 w-4" />
                         </button>
                         <button
                           onClick={handleCancelEdit}
                           className="inline-flex items-center justify-center w-7 h-7 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                           type="button"
                           title="Cancel (Escape)"
                         >
                           <XIcon className="h-4 w-4" />
                         </button>
                       </div>
                     </>
                   ) : (
                     // Display mode - works for both user and assistant messages
                     (() => {
                       const isString = typeof message.content === "string";
                       const raw = isString ? (message.content as string) : String(message.content ?? "");
                       const normalizedLength = raw.replace(/\s+/g, " ").trim().length;
                       const isLong = normalizedLength > LONG_TEXT_THRESHOLD;
                       const isExpanded = !!expandedByIndex[index];
                       const contentId = `msg-content-${index}`;
                       
                       return (
                         <>
                           <div 
                             id={contentId} 
                             className={`relative ${
                               isLong && !isExpanded 
                                 ? "overflow-hidden" 
                                 : "overflow-visible"
                             }`}
                             style={{
                               maxHeight: isLong && !isExpanded ? '120px' : 'none',
                               transition: 'max-height 0.3s ease-in-out'
                             }}
                           >
                             {isString ? (
                               <div className="space-y-3">
                                 {raw
                                   .split(/\n\s*\n/) // split into paragraphs on blank lines
                                   .flatMap((para) => para.split(/\n/).join("\n"))
                                   .map((para, i) => (
                                     <p key={i} className="whitespace-pre-line break-words overflow-wrap-anywhere">
                                       {para}
                                     </p>
                                   ))}
                               </div>
                             ) : (
                               renderMessageContent(message)
                             )}
                             {isLong && !isExpanded && (
                               <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-[#08121f] to-transparent pointer-events-none" />
                             )}
                           </div>
                           {isLong && (
                             <div className={`mt-2 flex ${message.role === "assistant" ? "justify-end" : "justify-start"}`}>
                               <button
                                 type="button"
                                 onClick={() => {
                                   console.log(`Toggling expand for message ${index}, current state: ${isExpanded}`);
                                   toggleExpanded(index);
                                 }}
                                 className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded transition-colors duration-200"
                                 aria-expanded={isExpanded}
                                 aria-controls={contentId}
                               >
                                 <span>{isExpanded ? "Show less" : "Show more"}</span>
                                 {isExpanded ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
                               </button>
                             </div>
                           )}
                         </>
                       );
                     })()
                   )}
                 </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {isLoading &&
        (processingCommand ? (
          // Custom loader for /create-agent and /image-gen
          <ResultBlock
            type="image"
            processing={true}
            onDownloadProof={handleDownload}
            imageResultType={imageResultType}
            onMintNFT={handleMintNFT}
            onLaunchMemeCoin={handleLaunchMemeCoin}
          />
        ) : (
          // Default loader
          <div className="text-center">
            <span className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></span>
            <p>Processing your query. This may take up to 5 minutes...</p>
          </div>
        ))}
    </div>
  );
};

export default RenderChatMessages;
