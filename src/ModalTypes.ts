type TextInput = {
  label: string;
  custom_id: string;
  required?: boolean;
  min_length?: number;
  max_length?: number;
  placeholder?: string;
  value?: string;
};

type Modal = {
  title: string;
  custom_id: string;
  components: [TextInput];
};

export { TextInput, Modal };
