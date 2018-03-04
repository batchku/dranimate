import * as firebase from 'firebase';
import { getPuppetJsonFile } from 'services/storage/serializer';
import GifDB from 'services/api/models/GifDB';
import PuppetDB from 'services/api/models/PuppetDB';
import userService from 'services/api/userService';
import loadPuppetFromFile from 'services/storage/deserializer';

const PUPPET_COLLECTION = 'puppets';
const GIF_COLLECTION = 'gifs';

function getBlobFromUrl(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = () => resolve(xhr.response);
    xhr.ontimeout = error => reject(error);
    xhr.onerror = error => reject(error);
    xhr.open('GET', url);
    xhr.send();
  });
}

class ApiService {

  constructor() {
    this.db = firebase.firestore();
    this.storage = firebase.storage();
  }

  getAllPuppetsForUser() {
    const userId = userService.getUserId();
    return this.db.collection(PUPPET_COLLECTION).where('userId', '==', userId).get()
      .then(snapshot => snapshot.docs.map((doc) =>
        PuppetDB.fromJson(doc.data()).setDatabaseId(doc.id)
      ))
      .catch(error => console.log(error));
  }

  getAllGifsForUser() {
    const userId = userService.getUserId();
    return this.db.collection(GIF_COLLECTION).where('userId', '==', userId).get()
      .then(snapshot => snapshot.docs.map((doc) =>
        GifDB.fromJson(doc.data()).setDatabaseId(doc.id)
      ))
      .catch(error => console.log(error));
  }

  openPuppet(puppetModel) {
    return this.storage.ref().child(puppetModel.getStorageRef()).getDownloadURL()
      .then(getBlobFromUrl)
      .then(loadPuppetFromFile);
  }

  deletePuppet(puppetModel) {
    console.log('delete puppet', puppetModel)
    const documentId = puppetModel.getDatabaseId();
    const puppetJsonRef = this.storage.ref().child(puppetModel.getStorageRef());
    const foregroundImageRef = this.storage.ref().child(puppetModel.getThumbnailStorageRef());
    return Promise.all([
      puppetJsonRef.delete(),
      foregroundImageRef.delete()
    ])
    .then(() => {
      console.log('storage refs deleted');
      return this.db.collection(PUPPET_COLLECTION).doc(documentId).delete();
    });
  }

  deleteGif(gifModel) {
    const documentId = gifModel.getDatabaseId();
    const gifStorageRef = this.storage.ref().child(gifModel.getStorageRef());
    return gifStorageRef.delete()
      .then(() => this.db.collection(GIF_COLLECTION).doc(documentId).delete());
  }

  savePuppet(puppet) {
    // save puppet json blob & puppet thumbnail to storage
    // save puppetID, puppetName, jsonBlobRef, and storageRef to DB

    const userId = userService.getUserId();
    const base64Thumbnail = puppet.imageNoBG.src;
    const puppetJsonBlob = getPuppetJsonFile(puppet);
    const puppetJsonRef = this.storage.ref().child(`test${Math.random()}`);
    const foregroundImageRef = this.storage.ref().child(`testthumb${Math.random()}`);
    return Promise.all([
      puppetJsonRef.put(puppetJsonBlob),
      foregroundImageRef.putString(base64Thumbnail, 'data_url')
    ])
    .then(([puppetJsonSnapshot, thumbnailSnapshot]) => {
      const puppetStorageRef = puppetJsonSnapshot.metadata.fullPath;
      const thumbnailStorageRef = thumbnailSnapshot.metadata.fullPath;
      const thumbnailUrl = thumbnailSnapshot.downloadURL;
      const puppetModel = new PuppetDB()
        .setName(puppet.getName())
        .setStorageRef(puppetStorageRef)
        .setThumbnailStorageRef(thumbnailStorageRef)
        .setThumbnailUrl(thumbnailUrl)
        .setUserId(userId)
        .toJson();

      const docName = `${puppet.name}-${Math.random()}`;

      return this.db.collection(PUPPET_COLLECTION).add(puppetModel);

      // TODO: use uuid for puppet creation, then use set
      // return this.db.collection(PUPPET_COLLECTION).doc(PUPPET-UUID).set(data);
    })
  }

  saveGif(gifBlob, gifName) {
    const userId = userService.getUserId();
    const gifRef = this.storage.ref().child(`gif-${Math.random()}`);

    return gifRef.put(gifBlob)
      .then((gifSnapshot) => {
        const gifStorageRef = gifSnapshot.metadata.fullPath;
        const url = gifSnapshot.downloadURL;
        const gifModel = new GifDB()
          .setName(gifName)
          .setStorageRef(gifStorageRef)
          .setUrl(url)
          .setUserId(userId)
          .toJson();
        return this.db.collection(GIF_COLLECTION).add(gifModel);
      });
  }

  getGifBlob(gifUrl) {
    return getBlobFromUrl(gifUrl);
  }

}

const apiService = new ApiService();
export default apiService;
