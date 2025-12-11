function Textarea({
  placeholder,
  value,
  onChange,
  name,
  required = false,
  rows = 4,
  className = '',
  disabled = false,
  ...props
}) {
  const baseClasses =
    'w-full py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-300 resize-none';
  const paddingClasses = 'px-4';
  const disabledClasses = disabled
    ? 'bg-gray-100 cursor-not-allowed opacity-75'
    : '';

  return (
    <textarea
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      rows={rows}
      className={`${baseClasses} ${paddingClasses} ${disabledClasses} ${className}`}
      {...props}
    />
  );
}

export default Textarea;
