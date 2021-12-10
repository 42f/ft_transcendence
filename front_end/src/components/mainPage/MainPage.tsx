import React, { useEffect } from 'react';
import './mainPage.scss';
import { Routes, Route } from 'react-router-dom';
import { Header, ParamUser, UserRank, HistoryGame, Game, SnackBarre } from '..';
import axios from 'axios';

import { useMainPage } from '../../MainPageContext';

const MainPage = () => {
	const { timeSnack, setData, setTimeSnack } = useMainPage();

	const fetchData = async () => {
		const result = await axios('http://localhost:3000/users', {
			withCredentials: true,
		});
		setData(result.data);
	};

	useEffect(() => {
		fetchData();
	}, []);

	const resetTimeSnack = () => {
		setTimeSnack(false);
	};

	return (
		<div className="mainPageBody d-flex flex-column ">
			{timeSnack && <SnackBarre onClose={resetTimeSnack} />}
			<div>
				<Header />
			</div>

			<Routes>
				<Route path="/MainPage" element={<Game />} />
				<Route path="/History-Game" element={<HistoryGame />} />
				<Route path="/Setting" element={<ParamUser />} />

				<Route path="/Rank" element={<UserRank />} />
			</Routes>
		</div>
	);
};

export default MainPage;
