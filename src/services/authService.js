import {getStore} from '../store/configureStore';
import storage from '../utils/Storage';

class AuthService {
	static getUsername() {
		return getStore().getState().auth.user || storage.username
	}

	static getPostingKey() {
		return getStore().getState().auth.postingKey || storage.postingKey
	}
}

export default AuthService;