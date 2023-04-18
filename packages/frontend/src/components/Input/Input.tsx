import { InputHTMLAttributes, FunctionComponent, forwardRef } from 'react';

type InputProps = {
  id: string;
  className?: string;
  icon?: { src: string; alt: string };
} & InputHTMLAttributes<HTMLInputElement>;

const Input: FunctionComponent<InputProps> = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...rest }, ref) => {
    return (
      <div className="relative">
        {icon && <img className="absolute top-8 left-6 h-12 w-12" src={icon.src} alt={icon.alt} />}
        <input
          autoComplete="off"
          className={`${className} border-flashbang-white bg-new-black text-flashbang-white focus:border-pixel-blue focus-visible:border-pixel-blue block h-28 w-full rounded-md border border-b-[6px] px-6 text-2xl focus-visible:outline-none disabled:hover:cursor-not-allowed ${
            icon && 'pl-[5.5rem]'
          }`}
          ref={ref}
          spellCheck={false}
          {...rest}
        />
      </div>
    );
  }
);

export { Input };
