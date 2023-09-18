import { ViemError } from "src/types";
import { parseErrorMessage } from "./parseErrorMessage";

const getViemErrorMessage = (error: ViemError): string => {
  let message = 'An error occurred';

  if ('shortMessage' in error) {
    message = error.shortMessage;
  } else if (error.message) {
    message = error.message;
  }

  return parseErrorMessage(message);
};

export { getViemErrorMessage };
