export interface Badge {
	id: string;
	name: string;
	baseName: string;
	level: string;
	icon: string;
}

export interface Progress {
	totalCourses: number;
	completedCourses: number;
	badgesEarned: Badge[];
	lastActivityDate?: string;
	lastActivityName?: string;
}

export interface JwtPayload {
	roles: string;
	sub: string;
	given_name?: string;
}
