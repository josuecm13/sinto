export type { User };

interface User {
  id: string;
  email: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  isPublic: boolean;
  remindersEnabled: boolean;
  reminderTime: string | null;
  createdAt: string;
  updatedAt: string;
}
