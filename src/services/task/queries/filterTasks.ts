
import { TaskFilterParams } from "../types";
import { calculateDistance } from "../../location/distance";

/**
 * Applies post-query filtering for tasks based on budget and location
 */
export function applyTaskFilters(
  tasks: any[],
  filters: TaskFilterParams
): any[] {
  let filteredTasks = [...tasks];
  
  // Apply min budget filter if provided
  if (filters.minBudget !== undefined) {
    console.log(`Filtering by min budget: ${filters.minBudget}`);
    filteredTasks = filteredTasks.filter(task => {
      // Parse the budget as number for proper comparison
      const taskBudget = parseFloat(task.budget);
      console.log(`Task ${task.id}: comparing budget ${taskBudget} >= ${filters.minBudget}`);
      return !isNaN(taskBudget) && taskBudget >= filters.minBudget;
    });
    console.log(`After min budget filter (min: ${filters.minBudget}): ${filteredTasks.length} tasks remaining`);
  }
  
  // Apply max budget filter if provided
  if (filters.maxBudget !== undefined) {
    console.log(`Filtering by max budget: ${filters.maxBudget}`);
    filteredTasks = filteredTasks.filter(task => {
      // Parse the budget as number for proper comparison
      const taskBudget = parseFloat(task.budget);
      console.log(`Task ${task.id}: comparing budget ${taskBudget} <= ${filters.maxBudget}`);
      return !isNaN(taskBudget) && taskBudget <= filters.maxBudget;
    });
    console.log(`After max budget filter (max: ${filters.maxBudget}): ${filteredTasks.length} tasks remaining`);
  }
  
  // Apply location filtering only if provided
  if (filters.locationName && filters.locationName.trim() !== '') {
    console.log(`Filtering by location name: "${filters.locationName}"`);
    
    // Distance-based filtering if coordinates are available
    if (filters.latitude && filters.longitude && filters.distanceRadius) {
      console.log("Applying distance-based filtering:", {
        userLat: filters.latitude,
        userLong: filters.longitude,
        radius: filters.distanceRadius
      });
      
      filteredTasks = filteredTasks.filter(task => {
        // If task has coordinates, use distance calculation
        if (task.latitude && task.longitude) {
          const distance = calculateDistance(
            filters.latitude!, 
            filters.longitude!, 
            task.latitude, 
            task.longitude
          );
          
          console.log(`Task ${task.id} is ${distance.toFixed(1)}km away (max: ${filters.distanceRadius}km)`);
          return distance <= filters.distanceRadius;
        } 
        // If task doesn't have coordinates but has a location that matches the filter location
        else if (task.location && filters.locationName) {
          // Check if the task location contains the filter location name
          const isInLocation = task.location.toLowerCase().includes(filters.locationName.toLowerCase());
          console.log(`Task ${task.id} has no coordinates, but location "${task.location}" ${isInLocation ? 'matches' : 'does not match'} "${filters.locationName}"`);
          return isInLocation;
        }
        
        console.log(`Task ${task.id} has no coordinates or location, excluding from results`);
        return false;
      });
    }
    // Text-based location filtering
    else {
      console.log("Applying text-based location filtering");
      filteredTasks = filteredTasks.filter(task => {
        if (!task.location) {
          console.log(`Task ${task.id} has no location, excluding from results`);
          return false;
        }
        
        const isInLocation = task.location.toLowerCase().includes(filters.locationName!.toLowerCase());
        console.log(`Task ${task.id} location: "${task.location}" ${isInLocation ? 'matches' : 'does not match'} "${filters.locationName}"`);
        return isInLocation;
      });
    }
  }
  
  return filteredTasks;
}
