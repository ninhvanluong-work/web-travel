import { createInfiniteQuery, createMutation } from 'react-query-kit';

import { createTag, deleteTag, getTagPage, type TagPage, updateTag } from './requests';

type LookupItem = { id: string; name: string };

export const useTagListInfinite = createInfiniteQuery<TagPage, void, Error, number>({
  primaryKey: '/tag',
  queryFn: ({ pageParam = 1 }) => getTagPage(pageParam as number),
  getNextPageParam: (lastPage) => lastPage.nextPage,
  staleTime: 2 * 60 * 1000,
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
