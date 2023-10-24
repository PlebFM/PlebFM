interface InputProps {
  value?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  name?: string;
  id?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input = ({
  type = 'text',
  placeholder = '...',
  required = false,
  value,
  name,
  id,
  onChange,
}: InputProps) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="w-full p-4 text-lg bg-white/10 placeholder:text-pfm-neutral-800 text-pfm-orange-800 outline outline-2 outline-white focus:outline-pfm-orange-800"
      value={value}
      required={required}
      id={id}
      name={name}
      onChange={onChange}
    />
  );
};
