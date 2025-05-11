
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface TaskImageGalleryProps {
  photos: (string | File)[];
}

export default function TaskImageGallery({ photos }: TaskImageGalleryProps) {
  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Photos</h2>
      <Carousel className="w-full">
        <CarouselContent>
          {photos.map((photo, index) => (
            <CarouselItem key={index}>
              <img
                src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
                alt={`Task Photo ${index + 1}`}
                className="object-cover rounded-md w-full h-64"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
