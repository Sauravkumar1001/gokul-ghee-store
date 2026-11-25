import { useId, useState } from 'react';

/**
 * Premium Floating-Label Input component for Gokul Ghee auth and account forms.
 * Aligns to the Phase 1 Design System tokens with 44px+ touch targets and smooth Kaizen transitions.
 */
export default function FloatingInput({
  id,
  name,
  label,
  type = 'text',
  value = '',
  onChange,
  onFocus,
  onBlur,
  error,
  hint,
  leftIcon = null,
  rightSlot = null,
  placeholder = '',
  required = false,
  autoComplete,
  disabled = false,
  className = '',
  containerClassName = '',
  ...rest
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const descId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const isFloating = isFocused || hasValue;

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <div className={`space-y-1 ${containerClassName}`.trim()}>
      <div className="relative flex items-center">
        {leftIcon && (
          <div
            aria-hidden="true"
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none z-10 ${
              error
                ? 'text-[#8C2D19]'
                : isFocused
                  ? 'text-[#0F3D2E]'
                  : 'text-[#7A7468]'
            }`}
          >
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          name={name || inputId}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder || ' '}
          aria-invalid={Boolean(error)}
          aria-describedby={descId}
          className={[
            'peer w-full min-h-[54px] rounded-[14px] bg-[#FFFDF8] border text-sm text-[#1B1B1B] transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/30 disabled:opacity-55 disabled:cursor-not-allowed',
            // Placeholder opacity: hide placeholder visually when unfocused so the floating label sits there cleanly
            'placeholder:text-transparent focus:placeholder:text-[#7A7468]/50',
            leftIcon ? 'pl-11' : 'pl-4',
            rightSlot ? 'pr-11' : 'pr-4',
            'pt-5 pb-1.5',
            error
              ? 'border-[#8C2D19] focus:border-[#8C2D19] focus:ring-[#8C2D19]/20'
              : isFocused
                ? 'border-[#0F3D2E] ring-1 ring-[#0F3D2E]/20'
                : 'border-[#E6DEC9] hover:border-[#C9A24B]/60',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />

        {label && (
          <label
            htmlFor={inputId}
            className={[
              'absolute pointer-events-none transition-all duration-200 select-none',
              leftIcon ? 'left-11' : 'left-4',
              rightSlot ? 'right-11' : 'right-4',
              'truncate',
              isFloating
                ? 'top-2 text-[10px] font-bold uppercase tracking-wider text-[#9A7624]'
                : 'top-1/2 -translate-y-1/2 text-sm font-normal text-[#7A7468]',
              error ? '!text-[#8C2D19]' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {label}
            {required && <span className="text-[#8C2D19] ml-0.5">*</span>}
          </label>
        )}

        {rightSlot && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 flex items-center">
            {rightSlot}
          </div>
        )}
      </div>

      {error ? (
        <p id={descId} className="text-xs font-medium text-[#8C2D19] pl-1 pt-0.5">
          {error}
        </p>
      ) : hint ? (
        <p id={descId} className="text-xs text-[#5A554C] pl-1 pt-0.5">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
