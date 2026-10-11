import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCurrentUser, loginUser, registerUser, logoutUser } from '../services/authApi.js';
import type { LoginInput, RegisterInput, User } from '../types/auth.js';

export const AUTH_QUERY_KEY = ['auth', 'user'] as const;

export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: LoginInput) => loginUser(credentials),
    onSuccess: (user: User) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: RegisterInput) => registerUser(credentials),
    onSuccess: (user: User) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
    },
  });
}

export const useRegisterStudent = useRegister;

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logoutUser(),
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
    },
  });
}
