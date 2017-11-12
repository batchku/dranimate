
// type='file'
// ref={input => this.filePicker = input}
// onChange={this.onFileChange}
// className={styles.hiddenFilePicker}




function loadFile(element) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onloadend = event => {
        resolve(reader.result);
      };
      reader.onerror = error => reject(error);
      const file = element.files && element.files[0];
      if (!file) {
        reject(error);
      }
      reader.readAsDataURL(file);
    }
    catch(error) {
      reject(error);
    }
  });
}

export { loadFile };
