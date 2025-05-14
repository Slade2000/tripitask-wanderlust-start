
import { useState } from "react";
import { PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Certificate } from "@/contexts/auth/types";

interface CertificationsManagerProps {
  certifications: Certificate[];
  onAddCertificate: (name: string, file?: File) => Promise<void>;
  onRemoveCertificate: (index: number) => void;
  disabled: boolean;
  isUploading: boolean;
}

const CertificationsManager = ({
  certifications,
  onAddCertificate,
  onRemoveCertificate,
  disabled,
  isUploading
}: CertificationsManagerProps) => {
  const [newCertName, setNewCertName] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);

  const handleCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCertFile(e.target.files[0]);
    }
  };

  const handleAddCertificate = async () => {
    if (!newCertName.trim()) {
      return;
    }
    
    await onAddCertificate(newCertName, certFile || undefined);
    
    // Reset form
    setNewCertName('');
    setCertFile(null);
    
    // Reset the file input
    const fileInput = document.getElementById('cert-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="border rounded-md p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Certifications & Qualifications
      </label>
      
      {certifications.length > 0 ? (
        <div className="space-y-2 mb-4">
          {certifications.map((cert, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <span>{cert.name}</span>
                {cert.verified && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
                {cert.file_url && (
                  <a 
                    href={cert.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-blue-600 ml-2"
                  >
                    View file
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemoveCertificate(index)}
                className="text-red-500"
                disabled={disabled}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">No certifications added yet</p>
      )}
      
      <div className="space-y-2">
        <div className="flex space-x-2">
          <Input
            value={newCertName}
            onChange={(e) => setNewCertName(e.target.value)}
            placeholder="Certificate name"
            disabled={disabled || isUploading}
          />
          <Button 
            type="button" 
            size="sm" 
            onClick={handleAddCertificate}
            disabled={!newCertName.trim() || disabled || isUploading}
          >
            <PlusCircle size={16} className="mr-1" />
            Add
          </Button>
        </div>
        
        <div className="flex items-center">
          <Input
            id="cert-file"
            type="file"
            onChange={handleCertFileChange}
            className="flex-1"
            disabled={disabled || isUploading}
          />
          <span className="text-xs text-gray-500 ml-2">Optional</span>
        </div>
        
        {isUploading && (
          <p className="text-sm text-gray-500">Uploading certificate...</p>
        )}
      </div>
    </div>
  );
};

export default CertificationsManager;
