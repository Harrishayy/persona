import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

// In middleware auth mode, each page is protected by default.
// Exceptions are configured via the `unauthenticatedPaths` option.
export default authkitMiddleware({
    middlewareAuth: {
        enabled: true,
        unauthenticatedPaths: [
            '/',
            '/auth/login',
            '/auth/callback',
            '/join',
            '/play',
            // Allow anonymous players to join sessions
            '/api/sessions',
            // Allow anonymous players to submit answers
            '/api/answers',
        ],
    },
});

// Match all request paths except for the ones starting with:
// - _next/static (static files)
// - _next/image (image optimization files)
// - favicon.ico (favicon file)
// - public files (public folder)
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
