
import { useState } from "react";
import { getTaskById } from "@/services/task/queries/getTaskById";

export function useTaskDetails(initialTaskTitle = "") {
  const [taskTitle, setTaskTitle] = useState(initialTaskTitle);
  
  const loadTaskDetails = async (taskId: string) => {
    try {
      const task = await getTaskById(taskId);
      if (task) {
        setTaskTitle(task.title);
      }
    } catch (error) {
      console.error("Error loading task details:", error);
    }
  };

  return {
    taskTitle,
    loadTaskDetails
  };
}
