import { ButtonHTMLAttributes, FunctionComponent } from 'react';
import { Spinner } from '../Spinner/Spinner';

type ButtonProps = {
  isLoading?: boolean;
  size?: 'large' | 'normal';
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button: FunctionComponent<ButtonProps> = ({
  children,
  isLoading,
  size = 'normal',
  ...rest
}) => {
  const styles = {
    large: 'h-24',
    normal: 'h-20',
  };

  return (
    <button
      className={`bg-primary-purple text-flashbang-white focus:ring-pixel-blue flex ${styles[size]} w-full max-w-md place-items-center justify-center rounded-md border border-none py-2 px-4 text-lg uppercase shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-opacity-60 disabled:text-opacity-60 disabled:hover:bg-opacity-60`}
      disabled={isLoading}
      {...rest}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};

export { Button };
