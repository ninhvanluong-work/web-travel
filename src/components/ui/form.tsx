import type * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import type {
  ControllerProps,
  FieldPath,
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form';
import { Controller, FormProvider, useFormContext } from 'react-hook-form';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { FCC } from '@/types';

export interface FormWrapperProps<T extends FieldValues> {
  form: UseFormReturn<T, any>;
  onSubmit: SubmitHandler<T>;
  onError?: SubmitErrorHandler<T>;
  children?: React.ReactNode;
  formId?: string;
  className?: string;
}

const FormWrapper = <TFormValue extends FieldValues>({
  form,
  onSubmit,
  onError,
  children,
  formId = 'form-submit-wrapper',
  className,
}: FormWrapperProps<TFormValue>) => {
  return (
    <FormProvider {...form}>
      <form
        className={className}
        id={formId}
        onSubmit={form.handleSubmit(onSubmit as SubmitHandler<TFormValue>, onError)}
      >
        {children}
      </form>
    </FormProvider>
  );
};

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem: FCC<{ className?: string }> = ({ children, className }) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn(className)}>{children}</div>
    </FormItemContext.Provider>
  );
};
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { formItemId } = useFormField();
  return <Label ref={ref} className={cn('mb-1.5 block', className)} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
  ({ ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

    return (
      <Slot
        ref={ref}
        id={formItemId}
        aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
        aria-invalid={!!error}
        {...props}
      />
    );
  }
);
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField();

    return <p ref={ref} id={formDescriptionId} className={cn('text-muted-foreground text-sm', className)} {...props} />;
  }
);
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children }, _ref) => {
    const { t } = useTranslation();
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message) : children;

    return (
      <AnimatePresence initial={false}>
        {body ? (
          <motion.p
            key="msg"
            id={formMessageId}
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: '0.25rem' }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={cn('text-destructive text-sm font-medium overflow-hidden', className)}
          >
            {typeof body === 'string' ? t(body) : body}
          </motion.p>
        ) : null}
      </AnimatePresence>
    );
  }
);
FormMessage.displayName = 'FormMessage';

export { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormWrapper, useFormField };
