
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, X, FileImage, FileVideo } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  onSendMessage: (content: string, files: File[]) => void;
  isSubmitting: boolean;
}

export default function MessageInput({ onSendMessage, isSubmitting }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (!message.trim() && selectedFiles.length === 0) {
      toast({
        title: "Cannot send empty message",
        description: "Please enter a message or attach a file",
        variant: "destructive",
      });
      return;
    }

    onSendMessage(message.trim(), selectedFiles);
    setMessage("");
    setSelectedFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    
    // Validate file types (only images and videos)
    const validFiles = fileArray.filter(file => {
      const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
      if (!isValid) {
        toast({
          title: "Invalid file type",
          description: `Only images and videos are allowed. "${file.name}" is not supported.`,
          variant: "destructive",
        });
      }
      return isValid;
    });

    // Check file size (max 10MB per file)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    const sizeValidFiles = validFiles.filter(file => {
      const isValidSize = file.size <= MAX_SIZE;
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `"${file.name}" exceeds the maximum size of 10MB`,
          variant: "destructive",
        });
      }
      return isValidSize;
    });

    setSelectedFiles(prev => [...prev, ...sizeValidFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t p-3 bg-white">
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedFiles.map((file, index) => (
            <div key={index} className="relative rounded-md bg-gray-100 p-2 flex items-center">
              {file.type.startsWith('image/') ? (
                <FileImage size={16} className="mr-1 text-teal" />
              ) : (
                <FileVideo size={16} className="mr-1 text-teal" />
              )}
              <span className="text-xs truncate max-w-[100px]">{file.name}</span>
              <button 
                onClick={() => removeFile(index)}
                className="ml-1 text-gray-500 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <Textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="min-h-[60px] resize-none"
        />
        
        <div className="flex gap-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
            accept="image/*,video/*"
          />
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={20} />
          </Button>
          
          <Button 
            type="button" 
            onClick={handleSendMessage}
            disabled={isSubmitting || (!message.trim() && selectedFiles.length === 0)}
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
