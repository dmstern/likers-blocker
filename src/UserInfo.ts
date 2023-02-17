export interface UserInfo {
	screen_name: string;
	id: number;
	errors?: { code: number; message: string }[];
}
