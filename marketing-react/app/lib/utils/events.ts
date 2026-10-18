export interface ApiEvent {
	id: string;
	title: string;
	description?: string;
	imageUrl?: string;
	startDate: string;
	endDate?: string;
	venue?: string;
	maxTickets?: number;
	ticketsSold?: number;
	ticketPrice?: string;
}

export interface Event {
	id?: string;
	title: string;
	summary: string;
	description?: string;
	additional_details?: string;
	image?: string;
	imageUrl?: string;
	paid?: boolean;
	price?: string;
	ticketPrice?: string;
	date: string;
	startDate?: string;
	endDate?: string;
	venue: string;
	capacity?: number;
	ticketsSold?: number;
	url?: string;
	periodical?: "weekly" | "monthly";
	day?: number;
	host?: string;
	contact?: string;
	category?: string;
	tags?: string[];
	registration_deadline?: string;
	slug?: string;
}

const asNumber = (value: unknown): number => {
	const n = parseFloat(String(value ?? "0"));
	return Number.isFinite(n) ? n : 0;
};

export const formatPrice = (ticketPrice: unknown): string => {
	const price = asNumber(ticketPrice);
	return price > 0 ? `₦${price.toLocaleString()}` : "Free";
};

export function mapEvent(e: ApiEvent): Event {
	return {
		id: e.id,
		title: e.title,
		summary: e.description || e.title,
		description: e.description || "",
		image: e.imageUrl || "",
		imageUrl: e.imageUrl,
		date: e.startDate,
		startDate: e.startDate,
		endDate: e.endDate,
		venue: e.venue || "MSSN OAU Secretariat",
		capacity: e.maxTickets,
		ticketsSold: e.ticketsSold,
		slug: e.id,
	};
}

export function mapHomeEvent(e: ApiEvent): Event {
	const price = asNumber(e.ticketPrice);
	return {
		...mapEvent(e),
		additional_details: e.description || "",
		paid: price > 0,
		price: formatPrice(e.ticketPrice),
		ticketPrice: e.ticketPrice,
	};
}

export function mapEventDetail(e: ApiEvent): Event {
	return {
		id: e.id,
		title: e.title,
		summary: e.description || e.title,
		description: e.description || "",
		additional_details: e.description || "",
		image: e.imageUrl || "",
		imageUrl: e.imageUrl,
		date: e.startDate,
		startDate: e.startDate,
		endDate: e.endDate,
		venue: e.venue || "MSSN OAU Secretariat",
		capacity: e.maxTickets,
		ticketsSold: e.ticketsSold,
		slug: e.id,
	};
}

export function findEventBySlug(events: ApiEvent[] | undefined, slug: string): Event | undefined {
	const mapped = (events || []).map(mapEventDetail);
	return mapped.find((e) => e.id === slug || e.slug === slug);
}
