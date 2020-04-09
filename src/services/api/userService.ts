import * as firebase from 'firebase';

import userSignedInEvent from './../eventManager/user-signed-in-event';

class UserService {
	private _auth = firebase.auth();

	constructor() {
		this._auth.onAuthStateChanged(this.onAuthStateChanged);
	}

	public createAccount(email, password): Promise<firebase.auth.UserCredential> {
		return this._auth.createUserWithEmailAndPassword(email, password);
	}

	public signIn(email, password): Promise<firebase.auth.UserCredential> {
		return this._auth.signInWithEmailAndPassword(email, password);
	}

	public signInWithGoogle(): Promise<firebase.auth.UserCredential> {
		return this._auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
	}

	public signOut(): Promise<void> {
		return this._auth.signOut();
	}

	public isAuthenticated(): boolean {
		return !!this._auth.currentUser;
	}

	public getUser(): firebase.User {
		return this._auth.currentUser;
	}

	public getUserId(): string {
		return this._auth.currentUser.uid;
	}

	private onAuthStateChanged = (user: firebase.User): void => {
		userSignedInEvent.emit({
			user: user
		});
	}
}
export default new UserService();
