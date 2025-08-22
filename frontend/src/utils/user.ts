import { v4 as uuidv4 } from 'uuid';

const USER_ID_KEY = 'palatine_user_id';

export const getUserId = (): string => {
  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    userId = `user_${uuidv4()}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
};

export const setUserId = (userId: string): void => {
  localStorage.setItem(USER_ID_KEY, userId);
};