
export default class PuppetDB {
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

  getThumbnailStorageRef() {
    return this.thumbnailStorageRef;
  }

  setThumbnailStorageRef(thumbnailStorageRef) {
    this.thumbnailStorageRef = thumbnailStorageRef;
    return this;
  }

  getThumbnailUrl() {
    return this.thumbnailStorageRef;
  }

  setThumbnailUrl(thumbnailUrl) {
    this.thumbnailUrl = thumbnailUrl;
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
      thumbnailStorageRef: this.thumbnailStorageRef,
      thumbnailUrl: this.thumbnailUrl,
      userId: this.userId
    };
  }

  static fromJson(json) {
    return Object.assign(new PuppetDB(), json);
  }
}
