
interface TaskDescriptionProps {
  description: string;
}

export default function TaskDescription({ description }: TaskDescriptionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
      <h2 className="text-xl font-semibold mb-4">Description</h2>
      <p className="text-gray-600 whitespace-pre-line">{description}</p>
    </div>
  );
}
