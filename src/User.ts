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

	/**
	 * Add a new user to the set if was not already in it.
	 * @param user the user to be added
	 * @returns true if it was added, false if not.
	 */
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

	/**
	 * Merge a collection of multiple users into the set.
	 * @param users new users that should be added to the set
	 * @returns the number of how many new objects were stored.
	 */
	merge(users: UserType[]): number {
		const oldSize = this.size;

		users.forEach((user) => {
			this.add(user);
		});

		return this.size - oldSize;
	}

	/**
	 * Deletes a given user from the set, identified by it's screen_name or id.
	 * @param user the user to be deleted.
	 */
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

	splice(amount: number): UserType[] {
		return this.users.splice(0, amount);
	}

	/**
	 * Find a specific user by it's screen_name or id in the set.
	 * @param user the user object to find in the set.
	 * @returns the found user object, undefined if none was found.
	 */
	private find(user: AbstractUser): UserType | undefined {
		return this.users.find((item) => {
			if (item.screen_name) {
				return item.screen_name === user.screen_name;
			} else if (item.id) {
				return item.id === user.id;
			}
		});
	}

	/**
	 * Test if a user with the same screen_name or id is in the set.
	 * @param user a user object to test if it is in the set
	 * @returns true if a user with the given screen_name or id is in the set.
	 */
	has(user: AbstractUser): boolean {
		return this.find(user) !== undefined;
	}
}
