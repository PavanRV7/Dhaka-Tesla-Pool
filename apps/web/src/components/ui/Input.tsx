type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  name?: string;
  placeholder?: string;
  error?: string;
};

export function Input({ label, value, onChange, type = 'text', name, placeholder, error }: InputProps) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        aria-invalid={Boolean(error)}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
