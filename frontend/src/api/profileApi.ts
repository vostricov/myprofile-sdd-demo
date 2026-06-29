import { initialProfile } from "../domain/initialProfile";
import type { Profile } from "../domain/profileSchema";
import { loadProfile, saveProfile } from "./localProfileStorage";

export const profileApi = {
  async load(): Promise<Profile> {
    return loadProfile() ?? initialProfile;
  },

  async save(profile: Profile): Promise<Profile> {
    return saveProfile(profile);
  },
};
