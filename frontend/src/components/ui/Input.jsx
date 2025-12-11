function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  required = false,
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconClick,
  className = '',
  disabled = false,
  error = false,
  errorMessage = '',
  errorColor = 'orange', // 'orange' | 'red' | 'purple'
  ...props
}) {
  const baseClasses =
    'w-full py-4 border-2 rounded-xl focus:outline-none transition-colors duration-300 placeholder:text-base';
  
  // Border color classes
  const borderColorClasses = error
    ? errorColor === 'red'
      ? 'border-red-500 focus:border-red-600'
      : errorColor === 'purple'
      ? 'border-purple-500 focus:border-purple-600'
      : 'border-orange-500 focus:border-orange-600'
    : 'border-gray-200 focus:border-purple-500';
  
  const paddingClasses = Icon ? 'pl-12' : 'pl-4';
  const rightPaddingClasses = RightIcon ? 'pr-12' : 'pr-4';
  const disabledClasses = disabled
    ? 'bg-gray-100 cursor-not-allowed opacity-75'
    : '';

  // Error message color classes
  const errorMessageColorClasses = errorColor === 'red'
    ? 'text-red-600'
    : errorColor === 'purple'
    ? 'text-purple-600'
    : 'text-orange-600';

  return (
    <div className="w-full">
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
          className={`${baseClasses} ${borderColorClasses} ${paddingClasses} ${rightPaddingClasses} ${disabledClasses} ${className}`}
        {...props}
      />
      {RightIcon && (
        <button
          type="button"
          onClick={onRightIconClick}
          disabled={disabled}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <RightIcon className="w-5 h-5" />
        </button>
        )}
      </div>
      {error && errorMessage && (
        <p className={`text-sm ${errorMessageColorClasses} mt-1`}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default Input;
