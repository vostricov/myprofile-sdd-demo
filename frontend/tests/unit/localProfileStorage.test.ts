import { beforeEach, describe, expect, it } from "vitest";

import {
  clearStoredProfile,
  loadProfile,
  saveProfile,
} from "../../src/api/localProfileStorage";
import { initialProfile } from "../../src/domain/profileSchema";

const LEGACY_PROFILE_STORAGE_KEY = "myprofile-sdd-demo.profile";
const PROFILE_STORAGE_KEY = "myprofile-sdd-demo.profile.mock-v1";

describe("local profile storage", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        clear: () => storage.clear(),
        getItem: (key: string) => storage.get(key) ?? null,
        removeItem: (key: string) => storage.delete(key),
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    });
  });

  it("loads saved mock profile data", () => {
    window.localStorage.setItem(LEGACY_PROFILE_STORAGE_KEY, "legacy");

    const savedProfile = saveProfile(initialProfile);

    expect(loadProfile()).toEqual(savedProfile);
    expect(window.localStorage.getItem(LEGACY_PROFILE_STORAGE_KEY)).toBeNull();
  });

  it("removes legacy profile data instead of loading it", () => {
    window.localStorage.setItem(
      LEGACY_PROFILE_STORAGE_KEY,
      JSON.stringify(initialProfile),
    );

    expect(loadProfile()).toBeNull();
    expect(window.localStorage.getItem(LEGACY_PROFILE_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(PROFILE_STORAGE_KEY)).toBeNull();
  });

  it("clears saved profile data", () => {
    saveProfile(initialProfile);
    window.localStorage.setItem(LEGACY_PROFILE_STORAGE_KEY, "legacy");

    clearStoredProfile();

    expect(loadProfile()).toBeNull();
    expect(window.localStorage.getItem(LEGACY_PROFILE_STORAGE_KEY)).toBeNull();
  });
});
