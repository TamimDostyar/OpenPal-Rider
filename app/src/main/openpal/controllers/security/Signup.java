package openpal.controllers.security;

import openpal.controllers.profile.CreateProfile;

/**
 * Signup request payload — currently identical to {@link CreateProfile}.
 * Exists as a distinct type so signup fields can diverge from profile fields later.
 */
public class Signup extends CreateProfile {
}
