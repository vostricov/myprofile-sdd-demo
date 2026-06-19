import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import {
  initialProfile,
  profileSchema,
  sectionContentSchema,
  type Profile,
  type ProfileSection,
  type ProfileSectionContent,
} from "../domain/profileSchema";
import type { ViewerRole } from "../domain/permissions";

export type { ViewerRole } from "../domain/permissions";

export type DraftMap = Partial<Record<ProfileSection["id"], ProfileSectionContent>>;

export type UndoEntry = {
  profile: Profile;
  savedAt: string;
};

export type ProfileState = {
  profile: Profile;
  currentViewerRole: ViewerRole;
  drafts: DraftMap;
  isPreviewing: boolean;
  expandedSectionIds: string[];
  undoStack: UndoEntry[];
};

export type SaveMetadata = {
  lastEditedByUserId?: string;
  lastUpdated?: string;
};

export type SaveOptions = SaveMetadata & {
  now?: string;
};

export type ProfileAction =
  | { type: "setViewerRole"; role: ViewerRole }
  | { type: "toggleSection"; sectionId: string }
  | { type: "setSectionExpanded"; sectionId: string; expanded: boolean }
  | { type: "startDraft"; sectionId: string }
  | { type: "updateDraft"; sectionId: string; content: ProfileSectionContent }
  | { type: "cancelDraft"; sectionId?: string }
  | { type: "setPreview"; isPreviewing: boolean }
  | {
      type: "saveDraft";
      sectionId: string;
      savedAt: string;
      metadata?: SaveMetadata;
    }
  | {
      type: "saveAllDrafts";
      savedAt: string;
      metadata?: SaveMetadata;
    }
  | { type: "undoLastSave" }
  | { type: "clearUndoStack" };

export type ProfileActions = {
  setViewerRole: (role: ViewerRole) => void;
  toggleSection: (sectionId: string) => void;
  setSectionExpanded: (sectionId: string, expanded: boolean) => void;
  startDraft: (sectionId: string) => void;
  updateDraft: (sectionId: string, content: ProfileSectionContent) => void;
  cancelDraft: (sectionId?: string) => void;
  setPreview: (isPreviewing: boolean) => void;
  saveDraft: (sectionId: string, options?: SaveOptions) => void;
  saveAllDrafts: (options?: SaveOptions) => void;
  undoLastSave: () => void;
  clearUndoStack: () => void;
};

export type ProfileContextValue = {
  state: ProfileState;
  profile: Profile;
  visibleProfile: Profile;
  currentViewerRole: ViewerRole;
  drafts: DraftMap;
  hasDrafts: boolean;
  dispatch: React.Dispatch<ProfileAction>;
  actions: ProfileActions;
};

type ProfileProviderProps = {
  children: ReactNode;
  initialState?: ProfileState;
};

const MAX_UNDO_ENTRIES = 10;

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function createInitialProfileState(profile: unknown = initialProfile): ProfileState {
  const validatedProfile = profileSchema.parse(profile);

  return {
    profile: validatedProfile,
    currentViewerRole: "visitor",
    drafts: {},
    isPreviewing: false,
    expandedSectionIds: validatedProfile.sections[0]?.id
      ? [validatedProfile.sections[0].id]
      : [],
    undoStack: [],
  };
}

export function profileReducer(
  state: ProfileState,
  action: ProfileAction,
): ProfileState {
  switch (action.type) {
    case "setViewerRole":
      return { ...state, currentViewerRole: action.role };

    case "toggleSection":
      return {
        ...state,
        expandedSectionIds: state.expandedSectionIds.includes(action.sectionId)
          ? state.expandedSectionIds.filter((sectionId) => sectionId !== action.sectionId)
          : [...state.expandedSectionIds, action.sectionId],
      };

    case "setSectionExpanded":
      return {
        ...state,
        expandedSectionIds: action.expanded
          ? addUnique(state.expandedSectionIds, action.sectionId)
          : state.expandedSectionIds.filter((sectionId) => sectionId !== action.sectionId),
      };

    case "startDraft": {
      if (state.drafts[action.sectionId] !== undefined) {
        return state;
      }

      const section = getSection(state.profile, action.sectionId);

      return {
        ...state,
        drafts: { ...state.drafts, [action.sectionId]: section.content },
      };
    }

    case "updateDraft": {
      getSection(state.profile, action.sectionId);
      const content = sectionContentSchema.parse(action.content);

      return {
        ...state,
        drafts: { ...state.drafts, [action.sectionId]: content },
      };
    }

    case "cancelDraft": {
      const drafts = removeDraft(state.drafts, action.sectionId);

      return {
        ...state,
        drafts,
        isPreviewing: Object.keys(drafts).length > 0 && state.isPreviewing,
      };
    }

    case "setPreview":
      return { ...state, isPreviewing: action.isPreviewing };

    case "saveDraft": {
      if (state.drafts[action.sectionId] === undefined) {
        return state;
      }

      const drafts = { [action.sectionId]: state.drafts[action.sectionId] };
      const profile = applyDraftsToProfile(state.profile, drafts, action.metadata);
      const remainingDrafts = removeDraft(state.drafts, action.sectionId);

      return {
        ...state,
        profile,
        drafts: remainingDrafts,
        isPreviewing: Object.keys(remainingDrafts).length > 0 && state.isPreviewing,
        undoStack: pushUndo(state.undoStack, state.profile, action.savedAt),
      };
    }

    case "saveAllDrafts": {
      if (Object.keys(state.drafts).length === 0) {
        return state;
      }

      return {
        ...state,
        profile: applyDraftsToProfile(state.profile, state.drafts, action.metadata),
        drafts: {},
        isPreviewing: false,
        undoStack: pushUndo(state.undoStack, state.profile, action.savedAt),
      };
    }

    case "undoLastSave": {
      const [latestUndo, ...remainingUndoStack] = state.undoStack;

      if (!latestUndo) {
        return state;
      }

      return {
        ...state,
        profile: latestUndo.profile,
        drafts: {},
        isPreviewing: false,
        undoStack: remainingUndoStack,
      };
    }

    case "clearUndoStack":
      return { ...state, undoStack: [] };

    default:
      return exhaustive(action);
  }
}

export function getVisibleProfile(state: ProfileState): Profile {
  if (!state.isPreviewing || Object.keys(state.drafts).length === 0) {
    return state.profile;
  }

  return applyDraftsToProfile(state.profile, state.drafts);
}

export function ProfileProvider({
  children,
  initialState = createInitialProfileState(),
}: ProfileProviderProps) {
  const [state, dispatch] = useReducer(profileReducer, initialState);
  const visibleProfile = useMemo(() => getVisibleProfile(state), [state]);
  const actions = useMemo<ProfileActions>(
    () => ({
      setViewerRole: (role) => dispatch({ type: "setViewerRole", role }),
      toggleSection: (sectionId) => dispatch({ type: "toggleSection", sectionId }),
      setSectionExpanded: (sectionId, expanded) =>
        dispatch({ type: "setSectionExpanded", sectionId, expanded }),
      startDraft: (sectionId) => dispatch({ type: "startDraft", sectionId }),
      updateDraft: (sectionId, content) =>
        dispatch({ type: "updateDraft", sectionId, content }),
      cancelDraft: (sectionId) => dispatch({ type: "cancelDraft", sectionId }),
      setPreview: (isPreviewing) => dispatch({ type: "setPreview", isPreviewing }),
      saveDraft: (sectionId, options) => {
        const savedAt = options?.now ?? new Date().toISOString();

        dispatch({
          type: "saveDraft",
          sectionId,
          savedAt,
          metadata: toSaveMetadata(options, savedAt),
        });
      },
      saveAllDrafts: (options) => {
        const savedAt = options?.now ?? new Date().toISOString();

        dispatch({
          type: "saveAllDrafts",
          savedAt,
          metadata: toSaveMetadata(options, savedAt),
        });
      },
      undoLastSave: () => dispatch({ type: "undoLastSave" }),
      clearUndoStack: () => dispatch({ type: "clearUndoStack" }),
    }),
    [],
  );
  const value = useMemo<ProfileContextValue>(
    () => ({
      state,
      profile: state.profile,
      visibleProfile,
      currentViewerRole: state.currentViewerRole,
      drafts: state.drafts,
      hasDrafts: Object.keys(state.drafts).length > 0,
      dispatch,
      actions,
    }),
    [actions, state, visibleProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider.");
  }

  return context;
}

function applyDraftsToProfile(
  profile: Profile,
  drafts: DraftMap,
  metadata?: SaveMetadata,
): Profile {
  const nextProfile: Profile = {
    ...profile,
    sections: profile.sections.map((section) => {
      const draftContent = drafts[section.id];

      if (draftContent === undefined) {
        return section;
      }

      return {
        ...section,
        content: draftContent,
        lastUpdated: metadata?.lastUpdated ?? section.lastUpdated,
        lastEditedByUserId: metadata?.lastEditedByUserId ?? section.lastEditedByUserId,
      };
    }),
  };

  return profileSchema.parse(nextProfile);
}

function getSection(profile: Profile, sectionId: string): ProfileSection {
  const section = profile.sections.find((candidate) => candidate.id === sectionId);

  if (!section) {
    throw new Error(`Profile section "${sectionId}" was not found.`);
  }

  return section;
}

function removeDraft(drafts: DraftMap, sectionId?: string): DraftMap {
  if (sectionId === undefined) {
    return {};
  }

  const { [sectionId]: _removedDraft, ...remainingDrafts } = drafts;
  return remainingDrafts;
}

function pushUndo(
  undoStack: UndoEntry[],
  profile: Profile,
  savedAt: string,
): UndoEntry[] {
  return [{ profile, savedAt }, ...undoStack].slice(0, MAX_UNDO_ENTRIES);
}

function addUnique(values: string[], value: string): string[] {
  return values.includes(value) ? values : [...values, value];
}

function toSaveMetadata(options: SaveOptions | undefined, savedAt: string): SaveMetadata {
  return {
    lastEditedByUserId: options?.lastEditedByUserId,
    lastUpdated: options?.lastUpdated ?? savedAt,
  };
}

function exhaustive(value: never): never {
  throw new Error(`Unhandled profile action: ${JSON.stringify(value)}`);
}
