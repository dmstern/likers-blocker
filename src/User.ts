export interface UserInfo {
	screen_name?: string;
	profile_image_url_https?: string;
	id?: number;
	errors?: { code: number; message: string }[];
}

interface AbstractUser {
	screen_name?: string;
	id?: string;
}

export interface BlockedUser extends AbstractUser {
	interacted_with?: string;
}

export interface QueuedUser extends BlockedUser {
	profile_image_url_https?: string;
}

export class UserSet<UserType extends AbstractUser> {
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

	add(user: UserType): boolean {
		if (!user.id && !user.screen_name) {
			return false;
		}

		if (this.has(user)) {
			return false;
		}

		this.users.push(user);
		return true;
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

	private find(user: AbstractUser): UserType | undefined {
		return this.users.find((item) => {
			if (item.screen_name) {
				return item.screen_name === user.screen_name;
			} else if (item.id) {
				return item.id === user.id;
			}
		});
	}

	has(user: AbstractUser): boolean {
		return this.find(user) !== undefined;
	}
}
