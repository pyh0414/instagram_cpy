import { Resolver, Query, Mutation, Arg, Ctx } from "type-graphql";
import bcrypt from "bcryptjs";

import {
	User,
	createUserInput,
	signInInput,
	CTX,
	AuthPayload,
	followUnfollowUserInput,
} from "./type";
import getHashedPassword from "../../utils/getHashedPassword";
import generateToken from "../../utils/generateToken";

@Resolver()
export class UserResolver {
	@Query((returns) => User, { nullable: true })
	async user(@Arg("userId") userId: string, @Ctx() ctx: CTX) {
		try {
			const { prisma } = ctx;
			const user = prisma.user.findOne({
				where: {
					userId,
				},
			});
			return user;
		} catch (err) {
			console.log(err);
			throw new Error(err);
		}
	}

	@Mutation((returns) => User, { nullable: true })
	async unFollowUser(
		@Arg("data") data: followUnfollowUserInput,
		@Ctx() ctx: CTX
	) {
		try {
			const { prisma } = ctx;
			const { me, you } = data;

			const unFolloweUser = await prisma.user.findOne({
				where: {
					id: you,
				},
			});

			await prisma.user.update({
				where: {
					id: me,
				},
				data: {
					following: {
						disconnect: {
							id: you,
						},
					},
				},
			});

			return unFolloweUser;
		} catch (err) {
			console.log(err);
			throw new Error("err");
		}
	}

	@Mutation((returns) => User, { nullable: true })
	async followUser(
		@Arg("data") data: followUnfollowUserInput,
		@Ctx() ctx: CTX
	) {
		try {
			const { prisma } = ctx;
			const { me, you } = data;

			await prisma.user.update({
				where: {
					id: me,
				},
				data: {
					following: {
						connect: {
							id: you,
						},
					},
				},
			});

			const folloUser = await prisma.user.findOne({
				where: {
					id: you,
				},
			});

			return folloUser;
		} catch (err) {
			console.log(err);
			throw new Error("err");
		}
	}

	@Query((returns) => AuthPayload)
	async signIn(@Arg("user") user: signInInput, @Ctx() ctx: CTX) {
		try {
			const { prisma } = ctx;
			const { userId, userPw } = user;
			const fullUser = await prisma.user.findOne({
				where: {
					userId,
				},
				include: {
					following: true,
					follower: true,
					myPosts: {
						include: {
							images: true,
							author: true,
							likers: {
								include: {
									user: true,
								},
							},
							comments: {
								include: {
									author: true,
								},
							},
						},
					},
				},
			});

			if (!fullUser) {
				return {
					message: "존재하지 않는 아이디 입니다.",
					user: null,
					token: null,
				};
			}

			const isPasswordSame = await bcrypt.compare(userPw, fullUser.userPw);

			if (!isPasswordSame) {
				return {
					message: "비밀번호가 유효하지 않습니다",
					user: null,
					token: null,
				};
			}

			const Token = generateToken(userId);
			return {
				message: "로그인 되었습니다",
				user: fullUser,
				token: Token,
			};
		} catch (err) {
			console.log(err);
			throw new Error(err);
		}
	}

	@Mutation((returns) => Boolean)
	async createUser(@Arg("user") user: createUserInput, @Ctx() ctx: CTX) {
		try {
			const { userId, userPw, name, profile } = user;
			const { prisma } = ctx;
			const hashedPassword = await getHashedPassword(userPw);
			const newUser = await prisma.user.create({
				data: {
					userId,
					userPw: hashedPassword.toString(),
					name,
					profile,
				},
			});
			if (!newUser) {
				return false;
			}
			return true;
		} catch (err) {
			console.log(err);
			throw new Error(err);
		}
	}
}
