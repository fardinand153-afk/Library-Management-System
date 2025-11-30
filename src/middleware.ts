// Middleware disabled for simple localStorage-based authentication
// For a university project, we don't need complex route protection

export function middleware() {
    // Do nothing - allow all routes
    return;
}

export const config = {
    matcher: [],
};
