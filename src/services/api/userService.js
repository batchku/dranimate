import * as firebase from 'firebase';

class UserService {

  constructor() {
    this.auth = firebase.auth();
    this.authStateChangeObservers = new Set();
    this.auth.onAuthStateChanged(user => this.authStateChangeObservers.forEach(observer => observer(user)));
  }

  registerAuthChangeCallback(callback) {
    this.authStateChangeObservers.add(callback);
  }

  deregisterAuthChangeCallback(callback) {
    this.authStateChangeObservers.delete(callback);
  }

  createAccount(email, password) {
    return this.auth.createUserWithEmailAndPassword(email, password);
  }

  signIn(email, password) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  signInWithGoogle() {
    return this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  signOut() {
    return this.auth.signOut();
  }

  isAuthenticated() {
    return !!this.auth.currentUser;
  }

  getUser() {
    return this.auth.currentUser;
  }

  getUserId() {
    return this.auth.currentUser.uid;
  }

}

const userService = new UserService();
export default userService;
