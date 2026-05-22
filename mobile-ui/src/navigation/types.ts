export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  VerifyEmail: { email: string };
  ForgotPassword: undefined;
  ResetPassword: { resetToken?: string };
  Home: undefined;
};
