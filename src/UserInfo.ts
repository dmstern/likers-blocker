export interface User {
	screen_name: string;
	profile_image_url_https?: string;
	id?: number;
	errors?: { code: number; message: string }[];
}

export interface BlockedUser {
	screen_name: string;
	interacted_with: string;
}

export interface QueuedUser {
	screen_name: string;
	profile_image_url_https: string;
	interacted_with: string;
}

export interface AbstractUser {
	screen_name: string;
}

export class UserSet<UserType extends User | BlockedUser | QueuedUser> {
	private users: UserType[];

	constructor(users?: UserType[]) {
		this.users = [];

		if (users) {
			users.forEach((user) => {
				if (!this.find(user)) {
					this.users.push(user);
				}
			});
		}
	}

	add(user: UserType) {
		if (this.find(user)) {
			return;
		}

		this.users.push(user);
	}

	concat(users: UserType[]) {
		users.forEach((user) => {
			this.add(user);
		});
	}

	delete(user: UserType) {
		const foundUser = this.find(user);
		const index = this.users.indexOf(foundUser);
		if (index > -1) {
			this.users = this.users.splice(index, 1);
		}
	}

	/**
	 * get first element
	 */
	shift(): UserType | undefined {
		return this.users.shift();
	}

	get size() {
		return this.users.length;
	}

	toArray(): UserType[] {
		return this.users;
	}

	find(user: AbstractUser): UserType | undefined {
		return this.users.find((item) => item.screen_name === user.screen_name);
	}

	has(user: AbstractUser): boolean {
		return this.find(user) !== undefined;
	}
}
