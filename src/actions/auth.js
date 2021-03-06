import {push} from 'react-router-redux';
import {pushErrorMessage, pushMessage} from "./pushMessage";
import {hideBodyLoader, showBodyLoader} from "./bodyLoader";
import {checkSubscribeAndUpdateSettings, removeSettings} from "./settings";
import storage from "../utils/Storage";
import {unsubscribe} from "./oneSignal";
import UserService from "../services/userService";
import OneSignalService from "../services/oneSignalService";
import LoggingService from "../services/loggingService";
import ChainService from "../services/chainService";
import {setPostingKeyErrorMessage, setUsernameErrorMessage} from "./login";
import {getStore} from "../store/configureStore";
import Constants from "../common/constants";

function showMessage(message) {
	return dispatch => {
		dispatch(pushMessage(message));
		dispatch(hideBodyLoader());
	}
}

function loginError(error) {
	return dispatch => {
		dispatch(pushErrorMessage(error));
		dispatch({
			type: 'LOGIN_ERROR',
			error
		});
		dispatch(hideBodyLoader());
	}
}

export function login(username, postingKey) {
	return dispatch => {
		dispatch(showBodyLoader());
		ChainService.getAccounts(username)
			.then(response => {
				if (response.length === 0) {
					const errorMessage = 'Such user doesn\'t exist.';
					dispatch(setUsernameErrorMessage(errorMessage));
					return Promise.reject(errorMessage);
				}
				let pubWif = response[0].posting.key_auths[0][0];
				return ChainService.wifIsValid(postingKey, pubWif)
					.then(isValid => {
						if (!isValid) {
							return Promise.reject({actual: 128, expected: 1});
						}
						let avatar = getAvatar(response[0]);
						storage.user = username;
						storage.postingKey = postingKey;
						storage.like_power = 100;
						storage.avatar = avatar;
						storage.service = getStore().getState().services.name || Constants.SERVICES.steem.name;
						OneSignalService.addNotificationTags(username);
						dispatch(checkSubscribeAndUpdateSettings());
						dispatch({
							type: 'UPDATE_VOTING_POWER',
							voting_power: response[0].voting_power / 100
						});
						let parseResult = JSON.parse(response[0].json_metadata);
						dispatch({
							type: 'LOGIN_SUCCESS',
							postingKey,
							user: username,
							avatar,
							like_power: 100
						});
						dispatch(push('/feed'));
						dispatch(showMessage('Welcome to Steepshot, ' + (parseResult.profile.name || username) + '!'));
						LoggingService.logLogin();
					})
			})
			.catch((error) => {
				storage.user = null;
				storage.postingKey = null;
				storage.like_power = null;
				storage.avatar = null;
				if (error.actual === 128) {
					dispatch(setPostingKeyErrorMessage('Invalid posting key.'))
				}
				dispatch(loginError(error));
			})
	}
}

function getAvatar(profileData) {
	let avatar = null;
	try {
		const metadata = JSON.parse(profileData.json_metadata);
		avatar = metadata.profile['profile_image'];
	} catch (e) {
	}
	return avatar;
}

function logoutUser() {
	return {
		type: 'LOGOUT_SUCCESS'
	}
}

export function logout() {
	return (dispatch) => {
		dispatch(removeSettings());
		dispatch(unsubscribe());
		storage.user = null;
		storage.postingKey = null;
		storage.settings = null;
		storage.avatar = null;
		storage.like_power = null;
		OneSignalService.removeNotificationTags();
		dispatch(logoutUser());
		dispatch(push(`/browse`));
	}
}

export function updateVotingPower(username) {
	return (dispatch) => {
		UserService.getProfile(username).then(result => {
			dispatch({
				type: 'UPDATE_VOTING_POWER',
				voting_power: result.voting_power
			})
		}).catch(error => {
      dispatch({
				type: 'UPDATE_VOTING_POWER_ERROR',
				error
			})
		});
	}
}

export function setLikePower(likePower) {
	return (dispatch) => {
		storage.like_power = likePower;
		dispatch({
			type: 'SET_LIKE_POWER',
			like_power: likePower
		})
	}
}

export function setUserAuth() {
	return {
		type: 'SET_USER_AUTH'
	}
}