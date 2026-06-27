export type FormState = {
  ok?: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
  // états spécifiques
  needs2fa?: boolean;
  values?: Record<string, string>;
};

export const initialFormState: FormState = {};
