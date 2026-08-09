import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { getStoredToken, isTokenExpired, clearAuth } from '$lib/stores/authStore';

export const ssr = false;

const PUBLIC_ROUTES = ['/login', '/otp'];

export const load: LayoutLoad = async ({ url }) => {
	const path = url.pathname;
	if (PUBLIC_ROUTES.includes(path)) return {};

	const token = getStoredToken();
	if (!token || isTokenExpired()) {
		clearAuth();
		throw redirect(302, '/login');
	}
	return {};
};
