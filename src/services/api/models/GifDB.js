export default class GifDB {
  getDatabaseId() {
    return this.databaseId;
  }

  setDatabaseId(databaseId) {
    this.databaseId = databaseId;
    return this;
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
    return this;
  }

  getStorageRef() {
    return this.storageRef;
  }

  setStorageRef(storageRef) {
    this.storageRef = storageRef;
    return this;
  }

  getUrl() {
    return this.url;
  }

  setUrl(url) {
    this.url = url;
    return this;
  }

  getUserId() {
    return this.userId;
  }

  setUserId(userId) {
    this.userId = userId;
    return this;
  }

  toJson() {
    return {
      name: this.name,
      storageRef: this.storageRef,
      url: this.url,
      userId: this.userId
    };
  }

  static fromJson(json) {
    return Object.assign(new GifDB(), json);
  }
}
