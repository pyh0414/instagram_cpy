import jwt from "jsonwebtoken";

export default async (ctx: any): Promise<string | null> => {
	const token: string = ctx.request.request.headers.authorization.split(
		"Bearer "
	)[1];

	if (token) {
		const user = jwt.verify(token, "secret");
		return user.userId;
	}
	return null;
};
