export interface InputProps {
  label?: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => string | void;

  disabled?: boolean;
  readOnly?: boolean;
  className?: string; 

}
