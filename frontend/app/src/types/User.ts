export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  themePreference: 'light' | 'dark' | 'system';
  languagePreference: string;
}
