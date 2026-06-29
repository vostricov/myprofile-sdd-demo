import type { Profile } from "../domain/profileSchema";
import { assertProfile } from "../domain/profileValidation";

const LEGACY_PROFILE_STORAGE_KEYS = ["myprofile-sdd-demo.profile"];
const PROFILE_STORAGE_KEY = "myprofile-sdd-demo.profile.mock-v1";

export function loadProfile(): Profile | null {
  const storage = getLocalStorage();

  if (!storage) {
    return null;
  }

  clearLegacyStoredProfiles(storage);

  const rawProfile = storage.getItem(PROFILE_STORAGE_KEY);

  if (!rawProfile) {
    return null;
  }

  try {
    return assertProfile(JSON.parse(rawProfile));
  } catch {
    storage.removeItem(PROFILE_STORAGE_KEY);
    return null;
  }
}

export function saveProfile(profile: Profile): Profile {
  const storage = getLocalStorage();
  const validatedProfile = assertProfile(profile);

  if (!storage) {
    return validatedProfile;
  }

  clearLegacyStoredProfiles(storage);
  storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(validatedProfile));
  return validatedProfile;
}

export function clearStoredProfile(): void {
  const storage = getLocalStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(PROFILE_STORAGE_KEY);
  clearLegacyStoredProfiles(storage);
}

function clearLegacyStoredProfiles(storage: Storage): void {
  for (const key of LEGACY_PROFILE_STORAGE_KEYS) {
    storage.removeItem(key);
  }
}

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}
