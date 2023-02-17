export interface UserInfo {
	screen_name: string;
	profile_image_url_https?: string;
	id: number;
	errors?: { code: number; message: string }[];
}
