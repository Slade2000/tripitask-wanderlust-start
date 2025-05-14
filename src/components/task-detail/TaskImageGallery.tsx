
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface TaskImageGalleryProps {
  photos: (string | File)[];
}

export default function TaskImageGallery({ photos }: TaskImageGalleryProps) {
  const [loadingImages, setLoadingImages] = useState<Record<number, boolean>>({});
  const [errorImages, setErrorImages] = useState<Record<number, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  useEffect(() => {
    // Reset loading and error states when photos change
    const initialLoadingState: Record<number, boolean> = {};
    photos.forEach((_, index) => {
      initialLoadingState[index] = true;
    });
    setLoadingImages(initialLoadingState);
    setErrorImages({});
  }, [photos]);

  if (!photos || photos.length === 0) {
    return null;
  }

  const handleImageLoad = (index: number) => {
    setLoadingImages(prev => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index: number) => {
    setLoadingImages(prev => ({ ...prev, [index]: false }));
    setErrorImages(prev => ({ ...prev, [index]: true }));
    console.error(`Failed to load image at index ${index}`);
  };

  const openFullImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
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
            <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/4">
              <div 
                className="cursor-pointer rounded-md overflow-hidden"
                onClick={() => openFullImage(typeof photo === 'string' ? photo : URL.createObjectURL(photo))}
              >
                <AspectRatio ratio={1/1}>
                  {loadingImages[index] && (
                    <Skeleton className="w-full h-full rounded-md" />
                  )}
                  <img
                    src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
                    alt={`Task Photo ${index + 1}`}
                    className={`object-cover w-full h-full ${loadingImages[index] ? 'hidden' : ''}`}
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                  />
                  {errorImages[index] && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
                      <p className="text-gray-500">Image failed to load</p>
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
