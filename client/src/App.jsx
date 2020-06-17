import React from "react";
import { Router } from "@reach/router";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";

import Pages from "./pages";
import SignIn from "./pages/signIn";
import SignUp from "./pages/signUp";

const IS_LOGGED_IN = gql`
	query {
		isLoggedIn @client
	}
`;

const App = () => {
	const { data } = useQuery(IS_LOGGED_IN);
	return data && data.isLoggedIn ? (
		<Pages />
	) : (
		<Router>
			<SignIn path="/" />
			<SignUp path="signUp" />
		</Router>
	);
};

export default App;
