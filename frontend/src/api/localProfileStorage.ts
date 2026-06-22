import { validateProfile, type Profile } from "../domain/profileSchema";

const PROFILE_STORAGE_KEY = "myprofile-sdd-demo.profile";

export function loadProfile(): Profile | null {
  const storage = getLocalStorage();

  if (!storage) {
    return null;
  }

  const rawProfile = storage.getItem(PROFILE_STORAGE_KEY);

  if (!rawProfile) {
    return null;
  }

  try {
    return validateProfile(JSON.parse(rawProfile));
  } catch {
    storage.removeItem(PROFILE_STORAGE_KEY);
    return null;
  }
}

export function saveProfile(profile: Profile): Profile {
  const storage = getLocalStorage();
  const validatedProfile = validateProfile(profile);

  if (!storage) {
    return validatedProfile;
  }

  storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(validatedProfile));
  return validatedProfile;
}

export function clearStoredProfile(): void {
  getLocalStorage()?.removeItem(PROFILE_STORAGE_KEY);
}

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}
