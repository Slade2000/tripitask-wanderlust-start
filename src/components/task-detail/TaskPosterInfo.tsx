
import { User } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TaskPosterInfoProps {
  user: User | null;
}

export default function TaskPosterInfo({ user }: TaskPosterInfoProps) {
  if (!user) return null;
  
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Task Poster</h2>
      <div className="flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.name as string} />
          <AvatarFallback>{user.user_metadata?.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <div className="text-gray-800 font-semibold">{user.user_metadata?.name}</div>
        </div>
      </div>
    </div>
  );
}
