export interface UserInfo {
	screen_name: string;
	profile_image_url_https?: string;
	id?: number;
	errors?: { code: number; message: string }[];
	interacted_with?: string;
}

export class UserSet {
	private users: UserInfo[];

	constructor(users?: UserInfo[]) {
		this.users = [];

		if (users) {
			users.forEach((user) => {
				if (!this.findUser(user)) {
					this.users.push(user);
				}
			});
		}
	}

	add(user: UserInfo) {
		if (this.findUser(user)) {
			return;
		}

		this.users.push(user);
	}

	delete(user: UserInfo) {
		const foundUser = this.findUser(user);
		const index = this.users.indexOf(foundUser);
		if (index > -1) {
			this.users = this.users.splice(index, 1);
		}
	}

	get length() {
		return this.users.length;
	}

	getUsers(): UserInfo[] {
		return this.users;
	}

	private findUser(user: UserInfo): UserInfo {
		return this.users.find((item) => item.screen_name === user.screen_name);
	}
}
