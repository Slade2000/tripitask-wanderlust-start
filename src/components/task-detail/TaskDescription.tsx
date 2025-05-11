
interface TaskDescriptionProps {
  description: string;
}

export default function TaskDescription({ description }: TaskDescriptionProps) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Description</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
