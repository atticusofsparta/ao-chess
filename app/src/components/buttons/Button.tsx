function Button({
  children,
  className,
  onClick,
  disabled,
  sound,
}: {
  children?: React.ReactNode;
  className?: string;
  onClick?: (e: any) => void;
  disabled?: boolean;
  sound?: Howl;
}) {
  return (
    <button
      onClick={(e) => {
        if (sound) sound.play();
        if (onClick) {
          onClick(e);
        }
      }}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
