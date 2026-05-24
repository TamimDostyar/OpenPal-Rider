/**
 * Route parameter map for the root navigation stack. Used to type-check
 * navigation calls and route params across every screen.
 */
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  VerifyEmail: { email: string };
  ForgotPassword: undefined;
  ResetPassword: { resetToken?: string };
  Home: undefined;
  CreatePost: undefined;
};
