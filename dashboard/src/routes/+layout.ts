import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const ssr = false;

const PUBLIC_ROUTES = ['/login', '/otp'];

export const load: LayoutLoad = async ({ url }) => {
	const path = url.pathname;
	if (PUBLIC_ROUTES.includes(path)) return {};

	const token = localStorage.getItem('mssn_admin_token');
	if (!token) {
		throw redirect(302, '/login');
	}
	return {};
};
