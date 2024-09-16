function InlineTextInput({
  title,
  value,
  setValue,
  onPressEnter,
  className = '',
  placeholder = '',
  disabled = false,
}: {
  title?: string;
  value: string;
  setValue: (value: string) => void;
  onPressEnter?: () => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-1">
      {title && <span className="text-sm">{title}</span>}
      <input
        className={className}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onPressEnter) {
            onPressEnter();
          }
        }}
      />
    </div>
  );
}

export default InlineTextInput;
