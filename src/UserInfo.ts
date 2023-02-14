export interface UserInfo {
	id: number;
	id_str: string;
	name: string;
	screen_name: string;
	location: string | null;
	url: string | null;
	description: string | null;
	protected: boolean;
	verified: boolean;
	followers_count: number;
	friends_count: number;
	listed_count: number;
	favourites_count: number;
	statuses_count: number;
	created_at: string;
	profile_banner_url: string;
	profile_image_url_https: string;
	default_profile: boolean;
	default_profile_image: boolean;
	withheld_in_countries: string[];
	withheld_scope: string;
	errors?: { code: number; message: string }[];
}
