import { useId } from 'react';

/**
 * Accessible form Input aligned to the 8px spacing grid and 44px+ touch targets.
 */
export function Input({
  label,
  hint,
  error,
  leftIcon = null,
  rightSlot = null,
  dark = false,
  id,
  className = '',
  containerClassName = '',
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const descId = error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined;

  const labelTone = dark ? 'text-[#E8D08B]' : 'text-[#0F3D2E]';
  const fieldTone = dark
    ? 'bg-[#0A2B20] text-[#FBF7EE] placeholder:text-[#FBF7EE]/45 border-[#C9A24B]/30 focus:border-[#C9A24B]'
    : 'bg-[#FFFDF8] text-[#1B1B1B] placeholder:text-[#5A554C]/65 border-[#0F3D2E]/18 focus:border-[#0F3D2E]';
  const errorBorder = error ? 'border-[#B84A24] focus:border-[#B84A24]' : '';

  return (
    <div className={`space-y-1.5 ${containerClassName}`.trim()}>
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-xs font-semibold tracking-wide ${labelTone}`}
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span
            aria-hidden="true"
            className={`absolute left-3.5 pointer-events-none ${
              dark ? 'text-[#C9A24B]/80' : 'text-[#5A554C]'
            }`}
          >
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={descId}
          className={[
            'w-full min-h-[46px] rounded-[12px] border text-sm transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/35 disabled:opacity-55 disabled:cursor-not-allowed',
            leftIcon ? 'pl-10' : 'pl-4',
            rightSlot ? 'pr-11' : 'pr-4',
            'py-2.5',
            fieldTone,
            errorBorder,
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />

        {rightSlot && (
          <div className="absolute right-3 flex items-center">{rightSlot}</div>
        )}
      </div>

      {error ? (
        <p id={descId} role="alert" className="text-xs font-medium text-[#B84A24]">
          {error}
        </p>
      ) : hint ? (
        <p id={descId} className={`text-xs ${dark ? 'text-[#FBF7EE]/65' : 'text-[#5A554C]'}`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Textarea({
  label,
  hint,
  error,
  dark = false,
  id,
  rows = 4,
  className = '',
  containerClassName = '',
  ...props
}) {
  const generatedId = useId();
  const areaId = id || generatedId;
  const descId = error ? `${areaId}-err` : hint ? `${areaId}-hint` : undefined;

  const labelTone = dark ? 'text-[#E8D08B]' : 'text-[#0F3D2E]';
  const fieldTone = dark
    ? 'bg-[#0A2B20] text-[#FBF7EE] placeholder:text-[#FBF7EE]/45 border-[#C9A24B]/30 focus:border-[#C9A24B]'
    : 'bg-[#FFFDF8] text-[#1B1B1B] placeholder:text-[#5A554C]/65 border-[#0F3D2E]/18 focus:border-[#0F3D2E]';
  const errorBorder = error ? 'border-[#B84A24] focus:border-[#B84A24]' : '';

  return (
    <div className={`space-y-1.5 ${containerClassName}`.trim()}>
      {label && (
        <label
          htmlFor={areaId}
          className={`block text-xs font-semibold tracking-wide ${labelTone}`}
        >
          {label}
        </label>
      )}

      <textarea
        id={areaId}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={descId}
        className={[
          'w-full rounded-[12px] border px-4 py-3 text-sm transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/35 disabled:opacity-55',
          fieldTone,
          errorBorder,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />

      {error ? (
        <p id={descId} role="alert" className="text-xs font-medium text-[#B84A24]">
          {error}
        </p>
      ) : hint ? (
        <p id={descId} className={`text-xs ${dark ? 'text-[#FBF7EE]/65' : 'text-[#5A554C]'}`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default Input;
