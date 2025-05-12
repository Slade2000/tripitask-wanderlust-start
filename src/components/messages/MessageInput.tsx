
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Paperclip } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  onSendMessage: (content: string, files: File[]) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export default function MessageInput({ onSendMessage, isSubmitting = false, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() || files.length > 0) {
      onSendMessage(message, files);
      setMessage("");
      setFiles([]);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 border-t border-gray-200">
      <div className="flex items-start space-x-2">
        <div className="flex-grow">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="resize-none"
            rows={1}
            disabled={disabled || isSubmitting}
          />
          
          {files.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div key={index} className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center">
                  {file.name}
                  <button
                    type="button"
                    className="ml-1 text-gray-500 hover:text-red-500"
                    onClick={() => setFiles(files.filter((_, i) => i !== index))}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex space-x-1">
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              multiple
              onChange={handleFileChange}
              disabled={disabled || isSubmitting}
            />
            <Paperclip className={`h-5 w-5 ${disabled ? 'text-gray-400' : 'text-gray-500 hover:text-teal-600'}`} />
          </label>
          
          <Button
            type="submit"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={(!message.trim() && files.length === 0) || isSubmitting || disabled}
          >
            {isSubmitting ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {disabled && (
        <p className="text-xs text-red-500 mt-1">You appear to be offline. Messages cannot be sent right now.</p>
      )}
    </form>
  );
}
