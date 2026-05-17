import { create } from 'zustand';
import { RepoData } from '@codemap/shared';

interface RepoStore {
  repoUrl: string;
  data: RepoData | null;
  setRepoUrl: (url: string) => void;
  setData: (data: RepoData) => void;
}

export const useRepoStore = create<RepoStore>((set) => ({
  repoUrl: '',
  data: null,
  setRepoUrl: (url) => set({ repoUrl: url }),
  setData: (data) => set({ data }),
}));
