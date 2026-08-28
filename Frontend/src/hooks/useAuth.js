import { useMutation } from '@tanstack/react-query';
import { authService } from '../api/services/authService';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: authService.login,
  });
};

export const useGoogleLoginMutation = () => {
  return useMutation({
    mutationFn: authService.googleLogin,
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: authService.register,
  });
};

export const useUpdatePasswordMutation = () => {
  return useMutation({
    mutationFn: authService.updatePassword,
  });
};

export const useVerifyOtpMutation = () => {
  return useMutation({
    mutationFn: authService.verifyOtp,
  });
};

export const useResendOtpMutation = () => {
  return useMutation({
    mutationFn: authService.resendOtp,
  });
};