export type RegisterModel = {
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
};

export type LoginModel = {
	usernameOrEmail: string;
	password: string;
};
