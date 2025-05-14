
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TaskImageGalleryProps {
  photos: (string | File)[];
}

export default function TaskImageGallery({ photos }: TaskImageGalleryProps) {
  const [loadingImages, setLoadingImages] = useState<Record<number, boolean>>({});
  const [errorImages, setErrorImages] = useState<Record<number, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState<Record<number, number>>({});
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
  
  useEffect(() => {
    // Reset states when photos change
    const initialLoadingState: Record<number, boolean> = {};
    const initialRetryState: Record<number, number> = {};
    const initialUrls: Record<number, string> = {};
    
    photos.forEach((photo, index) => {
      initialLoadingState[index] = true;
      initialRetryState[index] = 0;
      initialUrls[index] = typeof photo === 'string' ? photo : URL.createObjectURL(photo);
    });
    
    setLoadingImages(initialLoadingState);
    setErrorImages({});
    setRetryAttempts(initialRetryState);
    setImageUrls(initialUrls);
    
    // Initialize storage bucket if it doesn't exist yet
    checkAndInitializeStorageBucket();
    
    // Cleanup function for File URLs
    return () => {
      Object.values(initialUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [photos]);

  const checkAndInitializeStorageBucket = async () => {
    try {
      // Check if the bucket exists and is accessible
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) {
        console.error("Error accessing storage buckets:", error);
        return;
      }
      
      const taskPhotosBucketExists = buckets.some(bucket => bucket.name === 'task-photos');
      if (!taskPhotosBucketExists) {
        console.warn("Task photos bucket doesn't seem to exist");
        // Could create the bucket here, but typically this should be done in migrations
      } else {
        console.log("Task photos bucket exists");
      }
    } catch (e) {
      console.error("Failed to check storage bucket:", e);
    }
  };

  if (!photos || photos.length === 0) {
    return null;
  }

  const handleImageLoad = (index: number) => {
    setLoadingImages(prev => ({ ...prev, [index]: false }));
  };

  const handleImageError = async (index: number) => {
    console.error(`Failed to load image at index ${index}, URL: ${imageUrls[index]}`);
    
    // Try to fix common issues with Supabase URLs
    if (retryAttempts[index] === 0 && typeof imageUrls[index] === 'string') {
      // First retry: Try to use direct public URL if it's a Supabase URL
      const currentUrl = imageUrls[index];
      console.log(`Attempting to fix URL: ${currentUrl}`);
      
      let newUrl = currentUrl;
      
      // If URL contains Supabase storage path, try to reformulate it
      if (currentUrl.includes('storage/v1/object/public/')) {
        try {
          // Extract the path from the URL
          const parts = currentUrl.split('storage/v1/object/public/');
          if (parts.length > 1) {
            const pathParts = parts[1].split('/');
            const bucket = pathParts[0];
            const objectPath = pathParts.slice(1).join('/');
            
            // Get a fresh public URL
            const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
            if (data?.publicUrl) {
              newUrl = data.publicUrl;
              console.log(`Regenerated URL: ${newUrl}`);
            }
          }
        } catch (e) {
          console.error("Error reformulating URL:", e);
        }
      }
      
      // Try with the new URL
      setRetryAttempts(prev => ({ ...prev, [index]: prev[index] + 1 }));
      setImageUrls(prev => ({ ...prev, [index]: newUrl }));
      
      // Don't mark as error yet, we're retrying
      return;
    } 
    
    // If all retries failed, mark as error
    setLoadingImages(prev => ({ ...prev, [index]: false }));
    setErrorImages(prev => ({ ...prev, [index]: true }));
    
    // Show a toast for the error
    if (retryAttempts[index] >= 1) {
      toast({
        title: "Image loading failed",
        description: "There was a problem loading task images. This might be caused by permission issues.",
        variant: "destructive"
      });
    }
  };

  const openFullImage = (index: number) => {
    if (!errorImages[index]) {
      setSelectedImage(imageUrls[index]);
    }
  };

  const closeFullImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Photos</h2>
      <Carousel className="w-full">
        <CarouselContent>
          {photos.map((photo, index) => (
            <CarouselItem key={index} className="md:basis-1/4 lg:basis-1/5">
              <div 
                className="cursor-pointer rounded-md overflow-hidden"
                onClick={() => openFullImage(index)}
              >
                <AspectRatio ratio={1/1} className="bg-gray-100">
                  {loadingImages[index] && (
                    <Skeleton className="w-full h-full rounded-md" />
                  )}
                  <img
                    src={imageUrls[index]}
                    alt={`Task Photo ${index + 1}`}
                    className={`object-cover w-full h-full transition-opacity ${loadingImages[index] ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                    style={{
                      objectFit: 'cover'
                    }}
                  />
                  {errorImages[index] && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md absolute top-0 left-0">
                      <div className="text-center p-2">
                        <p className="text-gray-500 text-xs">Failed to load image</p>
                        <p className="text-gray-400 text-xs mt-1">Check image permissions</p>
                      </div>
                    </div>
                  )}
                </AspectRatio>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <Dialog open={!!selectedImage} onOpenChange={closeFullImage}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Full size task photo"
              className="w-full h-auto object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
