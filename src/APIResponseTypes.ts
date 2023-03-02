import { UserInfo } from "./User";

export interface Tweet {
	created_at: string;
	id: number;
	id_str: string;
	text: string;
	truncated: boolean;
	entities: {
		hashtags: string[];
		symbols: string[];
		user_mentions: string[];
		urls: {
			url: string;
			expanded_url: string;
			display_url: string;
			indices: number[];
		}[];
	};
	source: string;
	user: UserInfo;
	is_quote_status: boolean;
	retweet_count: number;
	favorite_count: number;
	favorited: boolean;
	retweeted: boolean;
	possibly_sensitive: boolean;
	possibly_sensitive_appealable: boolean;
	lang: string;
}

export interface List {
	created_at: string;
	slug: string;
	name: string;
	full_name: string;
	description: string;
	mode: string;
	following: boolean;
	user: UserInfo;
	member_count: number;
	id_str: string;
	subscriber_count: number;
	id: number;
	uri: string;
}
