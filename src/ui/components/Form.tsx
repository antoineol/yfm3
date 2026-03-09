import type { ComponentProps, ReactNode } from "react";
import { type FieldValues, FormProvider, type UseFormReturn } from "react-hook-form";

interface FormProps<T extends FieldValues> extends Omit<ComponentProps<"form">, "onSubmit"> {
  form: UseFormReturn<T>;
  onSubmit?: (values: T) => void;
  children: ReactNode;
}

export function Form<T extends FieldValues>({ form, onSubmit, children, ...props }: FormProps<T>) {
  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit ? form.handleSubmit(onSubmit) : (e) => e.preventDefault()}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
}
