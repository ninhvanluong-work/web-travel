import { createInfiniteQuery, createMutation } from 'react-query-kit';

import { createTag, deleteTag, getTagPage, searchTagPage, type TagPage, updateTag } from './requests';

type LookupItem = { id: string; name: string };

export const useTagListInfinite = createInfiniteQuery<TagPage, void, Error, number>({
  primaryKey: '/tag',
  queryFn: ({ pageParam = 1 }) => getTagPage(pageParam as number, 10),
  getNextPageParam: (lastPage) => lastPage.nextPage,
  staleTime: 2 * 60 * 1000,
});

export const useTagSearchInfinite = createInfiniteQuery<TagPage, { keyword: string }, Error, number>({
  primaryKey: '/tag/search',
  queryFn: ({ queryKey: [, vars], pageParam = 1 }) =>
    searchTagPage((vars as { keyword: string }).keyword, pageParam as number, 10),
  getNextPageParam: (lastPage) => lastPage.nextPage,
  staleTime: 30 * 1000,
});

export const useCreateTag = createMutation<LookupItem, string>({
  mutationFn: (name) => createTag(name),
});

export const useUpdateTag = createMutation<LookupItem, { id: string; name: string }>({
  mutationFn: ({ id, name }) => updateTag(id, name),
});

export const useDeleteTag = createMutation<void, string>({
  mutationFn: (id) => deleteTag(id),
});
