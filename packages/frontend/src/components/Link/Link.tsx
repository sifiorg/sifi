import { FunctionComponent, LinkHTMLAttributes } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';

const Link: FunctionComponent<LinkHTMLAttributes<HTMLAnchorElement> & { href: string }> = ({
  href,
  ...rest
}) => {
  return <ReactRouterLink to={href} {...rest} />;
};

export { Link };
