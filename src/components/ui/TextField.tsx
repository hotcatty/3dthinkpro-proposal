type Props = {
  type?: 'email' | 'text';
  name: string;
  placeholder: string;
  required?: boolean;
};

export default function TextField({ type = 'text', name, placeholder, required }: Props) {
  return (
    <input
      className="text-field"
      type={type}
      name={name}
      placeholder={placeholder}
      required={required}
    />
  );
}
