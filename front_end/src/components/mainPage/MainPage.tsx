import React, { useState } from 'react';
import './mainPage.scss';
import { Routes, Route } from 'react-router-dom';
import { Header, ParamUser, UserRank, HistoryGame, Game, SnackBarre, ErrorPage, Play } from '..';
import axios from 'axios';
import { useMainPage } from '../../MainPageContext';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useMount } from 'ahooks';
// import { useSafeState } from 'ahooks';
import { Backdrop, CircularProgress } from '@mui/material';

const MainPage = () => {
	const { timeSnack, setData, setTimeSnack } = useMainPage();
	// const [wsStatus, setWsStatus] = useSafeState<Socket | undefined>(undefined);
	// const [wsGame, setWsGame] = useSafeState<Socket | undefined>(undefined);
	const [wsStatus, setWsStatus] = useState<Socket | undefined>(undefined);
	const [wsGame, setWsGame] = useState<Socket | undefined>(undefined);
	const [time, setTime] = useState(false);
	const [isHeader, setIsHeader] = useState(true);

	let navigate = useNavigate();

	const fetchDataUserMe = async () => {
		return await axios
			.get('http://localhost:3000/me', {
				withCredentials: true,
			})
			.then((response) => {
				setData([response.data]);
			});
	};

	const setWsCallbacks = (socket: Socket, stateSetter: (value: React.SetStateAction<Socket | undefined>) => void) => {
		/* -----------------------
		 ** Connection
		 * -----------------------*/

		socket.on('connect', () => {
			console.log(`[CHAT SOCKET 🍄 ] WS CONNECT`);
			stateSetter(socket);
		});

		socket.on('disconnect', () => {
			console.log(`[CHAT SOCKET 🍄 ] WS DISCONNECTED`);
			doConnect(socket, stateSetter);
		});

		socket.on('connect_error', async (err) => {
			console.log('[CHAT SOCKET 🍄 ] connect_error', err);
			connectWs('ws://localhost:3000/chat', setWsCallbacks, stateSetter);
		});

		socket.io.on('error', (error) => {
			console.log('[CHAT SOCKET 🍄 ] ⚠️ RECEIVED ERROR', error);
		});

		/* -----------------------
		 ** Events
		 * -----------------------*/

		socket.on ('publicRoomCreated', (message)=> {
			console.log(`💌  Event: publicRoomCreated ->`, message);
		});
  	socket.on ('publicRoomUpdated', (message)=> {
			console.log(`💌  Event: publicRoomUpdated ->`, message);
		});
  	socket.on ('publicRoomRemoved', (message)=> {
			console.log(`💌  Event: publicRoomRemoved ->`, message);
		});
  	socket.on ('newMessage', (message)=> {
			console.log(`💌  Event: newMessage ->`, message);
		});
  	socket.on ('roomParticipantUpdated', (message)=> {
			console.log(`💌  Event: roomParticipantUpdated ->`, message);
		});
  	socket.on ('userAdded', (message)=> {
			console.log(`💌  Event: userAdded ->`, message);
		});
  	socket.on ('userRemoved', (message)=> {
			console.log(`💌  Event: userRemoved ->`, message);
		});
  	socket.on ('userModeration', (message)=> {
			console.log(`💌  Event: userModeration ->`, message);
		});
  	socket.on ('userBanned', (message)=> {
			console.log(`💌  Event: userBanned ->`, message);
		});
  	socket.on ('userMuted', (message)=> {
			console.log(`💌  Event: userMuted ->`, message);
		});

	};

	const otherCallbacks = (socket: Socket, stateSetter: (value: React.SetStateAction<Socket | undefined>) => void) => {
		/* -----------------------
		 ** Connection
		 * -----------------------*/

		socket.on('connect', () => {
			console.log(`[GAME SOCKET 🎲 ] WS CONNECT`);
		});

		socket.on('disconnect', () => {
			console.log(`[GAME SOCKET 🎲 ] WS DISCONNECTED`);
			doConnect(socket, stateSetter);
		});

		socket.on('connect_error', async (err) => {
			console.log('[GAME SOCKET 🎲 ] connect_error', err);
			connectWs('ws://localhost:3000/chat', otherCallbacks, stateSetter);
		});

		socket.io.on('error', (error) => {
			console.log('[GAME SOCKET 🎲 ] ⚠️ RECEIVED ERROR', error);
		});

	};
	const getAuthToken = async () => {
		return await axios('http://localhost:3000/auth/ws/token', {
			withCredentials: true,
		}).then((response) => {
			const { token } = response.data;
			if (!token) {
				throw new Error('no valid token');
			}
			return token;
		});
	};

	const doDisconnect = async (socket: Socket | undefined, stateSetter: (value: React.SetStateAction<Socket | undefined>) => void) => {
		stateSetter(undefined);
		if (socket) {
			socket.off('disconnect');
			socket.on('disconnect', () => {console.log('user chose to leave !')});
			socket.disconnect();
		}
	}

	const doConnect = async (socket: Socket, stateSetter: (value: React.SetStateAction<Socket | undefined>) => void) => {
		setTimeout(async () => {
			await getAuthToken()
				.then((token) => {
					console.log('DOCONNECT', socket);
					socket.auth = { key: `${token}` };
					socket.connect();
				})
				.catch((err) => {
					console.log('DOCONNECT ERROR ->', err);
					stateSetter(undefined);
					doConnect(socket, stateSetter);
				});
		}, 1000);
	};

	const connectWs = async (namespace: string, cbSetter: (socket: Socket, stateSetter:
		React.Dispatch<React.SetStateAction<Socket | undefined>>
		) => void, stateSetter: (value: React.SetStateAction<Socket | undefined>) => void	) => {
			await new Promise(res => {
				setTimeout(() => {
					const socket = io(namespace, {
						autoConnect: false,
						reconnection: false,
					});
					cbSetter(socket, stateSetter);
					stateSetter(socket);
					doConnect(socket, stateSetter);
					res('');
				}, 500);
			});
		};

			useMount(async () => {
				await fetchDataUserMe()
			.then(async () => {
				await connectWs('ws://localhost:3000/chat', setWsCallbacks, setWsStatus);
				await connectWs('ws://localhost:3000/game', otherCallbacks, setWsGame);
			})
			.catch((err) => {
				navigate('/');
			});
	});

	const resetTimeSnack = () => {
		setTimeSnack(false);
	};

	function disconnectGameWs() {
		console.log('cloc ', wsGame?.id);
		doDisconnect(wsGame, setWsGame);
	}

	return (
		<div className={`${isHeader ? 'mainPageBody' : ''} d-flex flex-column `}>
			<Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={time}>
				<CircularProgress color="inherit" />
			</Backdrop>
			{timeSnack && <SnackBarre onClose={resetTimeSnack} />}
			{isHeader ? (
				<div>
					<button onClick={disconnectGameWs} >DISCONNECT GAME WS</button>
					<Header />
				</div>
			) : null}

			<Routes>
				<Route path="/MainPage/*" element={<Game wsStatus={wsStatus} />} />
				<Route path="/History-Game" element={<HistoryGame />} />
				<Route path="/Setting" element={<ParamUser setTime={setTime} />} />
				<Route path="/Rank" element={<UserRank />} />

				<Route path="*" element={<ErrorPage isHeader={setIsHeader} />} />
			</Routes>
		</div>
	);
};
export default MainPage;
