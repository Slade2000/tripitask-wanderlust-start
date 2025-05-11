
export type AttachmentType = 'image' | 'video';

export interface MessageAttachment {
  id?: string;
  message_id?: string; 
  file_url: string;
  file_type: AttachmentType;
  created_at?: string;
}

export interface Message {
  id?: string;
  task_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at?: string;
  attachments?: MessageAttachment[];
  sender_name?: string;
  sender_avatar?: string;
}

export interface MessageThreadSummary {
  task_id: string;
  task_title: string;
  last_message_content: string;
  last_message_date: string;
  unread_count: number;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar?: string;
}
