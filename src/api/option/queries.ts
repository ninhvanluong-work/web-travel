import { createMutation } from 'react-query-kit';

import { createOption } from './requests';
import type { ApiOptionDetail, CreateOptionPayload } from './types';

export const useCreateOption = createMutation<ApiOptionDetail, CreateOptionPayload>({
  mutationFn: (payload) => createOption(payload),
});
