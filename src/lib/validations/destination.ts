import { z } from 'zod';

import { requiredText } from './text-fields';

export const DESTINATION_NAME_MIN = 2;
export const DESTINATION_NAME_MAX = 100;
export const DESTINATION_DESCRIPTION_MAX = 3000;

// Messages are i18n keys resolved by <FormMessage /> (namespace-prefixed)
export const destinationFormSchema = z.object({
  name: requiredText({
    min: DESTINATION_NAME_MIN,
    max: DESTINATION_NAME_MAX,
    message: 'adminDestination:nameLengthError',
    maxMessage: 'adminDestination:nameLengthError',
  }),
  // min 0: optional, but still normalized (trim, NFC) with inner line breaks kept
  description: requiredText({
    min: 0,
    max: DESTINATION_DESCRIPTION_MAX,
    maxMessage: 'adminDestination:descriptionTooLong',
    multiline: true,
  }),
});

export type DestinationFormValues = z.infer<typeof destinationFormSchema>;
