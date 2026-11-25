const SIZE_CLASSES = {
  narrow: 'max-w-4xl',
  prose: 'max-w-3xl',
  default: 'max-w-7xl',
  wide: 'max-w-[1440px]',
};

/**
 * Consistent responsive horizontal wrapper aligned to the 8px spacing grid.
 */
export default function Container({
  children,
  size = 'default',
  className = '',
  as: Component = 'div',
  ...props
}) {
  const maxWidth = SIZE_CLASSES[size] || SIZE_CLASSES.default;

  return (
    <Component
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${maxWidth} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}
