import { proxy } from "valtio";

export const state = proxy({
  selectedAccounts: [] as string[],
  botCopy: {} as {
    postUrl?: string;
    description?: string;
    tags?: string[];
    schedule?: boolean;

    comments?: string;
    like?: boolean;
  },
});
