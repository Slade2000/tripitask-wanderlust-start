
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskImageGalleryProps {
  photos: (string | File)[];
}

export default function TaskImageGallery({ photos }: TaskImageGalleryProps) {
  const [loadingImages, setLoadingImages] = useState<Record<number, boolean>>({});
  const [errorImages, setErrorImages] = useState<Record<number, boolean>>({});
  
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

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Photos</h2>
      <Carousel className="w-full">
        <CarouselContent>
          {photos.map((photo, index) => (
            <CarouselItem key={index}>
              {loadingImages[index] && (
                <Skeleton className="w-full h-64 rounded-md" />
              )}
              <img
                src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
                alt={`Task Photo ${index + 1}`}
                className={`object-cover rounded-md w-full h-64 ${loadingImages[index] ? 'hidden' : ''}`}
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageError(index)}
              />
              {errorImages[index] && (
                <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-md">
                  <p className="text-gray-500">Image failed to load</p>
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
