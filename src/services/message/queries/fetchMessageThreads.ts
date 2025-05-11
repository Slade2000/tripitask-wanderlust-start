
import { supabase } from "@/integrations/supabase/client";
import { MessageThreadSummary } from "../types";

/**
 * Fetches a list of message threads for a user, consolidated by other user
 */
export async function fetchMessageThreads(userId: string): Promise<MessageThreadSummary[]> {
  try {
    console.log("Fetching message threads for user:", userId);
    
    // Convert userId to lowercase once at the beginning for consistency
    const userIdLower = String(userId).toLowerCase();
    
    // First query: Get all unique conversations the user is involved in
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .select(`
        id,
        task_id,
        sender_id,
        receiver_id, 
        content,
        created_at,
        read,
        tasks:task_id (title)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (messageError) {
      console.error("Error fetching message threads:", messageError);
      throw messageError;
    }

    if (!messageData || messageData.length === 0) {
      console.log("No message threads found for user:", userId);
      return [];
    }

    console.log(`Found ${messageData.length} messages for user:`, userId);
    
    // Get all unique user IDs from the messages to fetch their profiles in a single query
    const otherUserIds = new Set<string>();
    messageData.forEach(message => {
      // Ensure IDs are consistently treated as strings and lowercase for comparison
      const senderIdStr = String(message.sender_id).toLowerCase();
      const receiverIdStr = String(message.receiver_id).toLowerCase();
      
      const otherUserId = senderIdStr === userIdLower ? receiverIdStr : senderIdStr;
      otherUserIds.add(otherUserId);
      console.log(`Message ID ${message.id}: Other user ID is ${otherUserId} (sender: ${senderIdStr}, receiver: ${receiverIdStr})`);
    });

    console.log("Unique other user IDs found:", Array.from(otherUserIds));

    // Second query: Fetch all profiles for the other users
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', Array.from(otherUserIds));

    if (profileError) {
      console.error("Error fetching user profiles:", profileError);
      throw profileError;
    }

    if (!profileData || profileData.length === 0) {
      console.error("No profiles found for user IDs:", Array.from(otherUserIds));
      
      // Additional debugging - check if profiles exist at all
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .limit(10);
        
      if (allProfilesError) {
        console.error("Error checking profiles table:", allProfilesError);
      } else {
        console.log("Sample profiles in database:", allProfiles);
      }
    } else {
      console.log(`Found ${profileData.length} profiles for ${otherUserIds.size} users`);
      profileData.forEach(profile => {
        console.log(`Profile found - ID: ${profile.id}, Name: ${profile.full_name || 'null'}, Type: ${typeof profile.id}`);
      });
    }

    // Create a map of user profiles for easy lookup - use lowercase keys for consistent matching
    const profilesMap = new Map<string, { full_name: string; avatar_url: string | null }>();
    profileData?.forEach(profile => {
      // Convert all IDs to lowercase strings for consistent lookup
      const profileId = String(profile.id).toLowerCase();
      profilesMap.set(profileId, { 
        full_name: profile.full_name || "Unknown User", 
        avatar_url: profile.avatar_url 
      });
      console.log(`Added to profilesMap: ${profileId} -> ${profile.full_name || "Unknown User"}`);
    });

    console.log("Created profiles map with entries:", profilesMap.size);
    
    // For debugging, log the keys in the map
    console.log("Profile map keys:", Array.from(profilesMap.keys()));

    // Group messages by conversation partner using a Map instead of an object
    const conversationsMap = new Map<string, any[]>();

    messageData.forEach(message => {
      // Ensure consistent ID format - always lowercase strings
      const senderIdStr = String(message.sender_id).toLowerCase();
      const receiverIdStr = String(message.receiver_id).toLowerCase();
      
      const otherUserId = senderIdStr === userIdLower ? receiverIdStr : senderIdStr;
      
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, []);
      }
      
      conversationsMap.get(otherUserId)!.push(message);
    });
    
    // Create thread summaries from the grouped conversations
    const threads: MessageThreadSummary[] = [];
    
    // Iterate through the Map entries
    for (const [otherUserId, messages] of conversationsMap.entries()) {
      // Sort messages to get the latest first
      messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      // Get the most recent message
      const latestMessage = messages[0];
      
      // Get profile info for the other user - make sure to use lowercase for lookup
      const otherUserIdLower = otherUserId.toLowerCase();
      
      console.log(`Looking up profile for user ID: ${otherUserIdLower}`);
      const otherUserProfile = profilesMap.get(otherUserIdLower);
      
      console.log(`Profile lookup result for ${otherUserIdLower}:`, otherUserProfile);
      
      // Fall back to direct lookup if not found in the map
      if (!otherUserProfile) {
        console.warn(`No profile found for user ID: ${otherUserId} in the profilesMap`);
        console.log(`Available profile IDs in map:`, Array.from(profilesMap.keys()));
        
        // Check if this ID exists in the profiles table directly
        const { data: directProfile, error: directError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', otherUserId)
          .single();
          
        if (directError) {
          console.error(`Error directly checking profile for ID ${otherUserId}:`, directError);
        } else {
          console.log(`Direct profile lookup result for ID ${otherUserId}:`, directProfile);
          
          // If we found a profile directly, add it to the map for future use
          if (directProfile) {
            profilesMap.set(otherUserIdLower, { 
              full_name: directProfile.full_name || "Unknown User", 
              avatar_url: directProfile.avatar_url 
            });
            
            console.log(`Added profile to map from direct lookup: ${otherUserIdLower} -> ${directProfile.full_name || "Unknown User"}`);
          }
        }
      }
      
      // Count unread messages
      const unreadCount = messages.filter(msg => 
        String(msg.sender_id).toLowerCase() !== userIdLower && !msg.read
      ).length;
      
      // Get the profile info, even if added from direct lookup
      const profile = profilesMap.get(otherUserIdLower);
      
      const thread: MessageThreadSummary = {
        task_id: latestMessage.task_id,
        task_title: latestMessage.tasks?.title || "Unknown Task",
        last_message_content: latestMessage.content || "",
        last_message_date: latestMessage.created_at || new Date().toISOString(),
        unread_count: unreadCount,
        other_user_id: otherUserId,
        other_user_name: profile ? profile.full_name : `User ${otherUserId.slice(0, 8)}...`,
        other_user_avatar: profile ? profile.avatar_url : null
      };
      
      console.log(`Created thread summary for ${otherUserId}: name=${thread.other_user_name}`);
      threads.push(thread);
    }
    
    // Sort threads by last message date
    threads.sort((a, b) => 
      new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime()
    );

    console.log("Returning thread summaries:", threads.length);
    return threads;
  } catch (error) {
    console.error("Error in fetchMessageThreads:", error);
    throw new Error("Failed to load messages: " + (error instanceof Error ? error.message : String(error)));
  }
}
