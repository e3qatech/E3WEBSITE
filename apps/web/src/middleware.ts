import { proxy } from './proxy';

export { proxy as middleware };

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
