import { useFormContext } from 'react-hook-form';
import { SwapFormValues } from 'src/providers/SwapFormProvider';

const useSwapFormValues = () => {
  const { watch } = useFormContext<SwapFormValues>();
  const formValues = watch();

  return formValues;
};

export { useSwapFormValues };
