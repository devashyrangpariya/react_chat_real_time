import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const upload = async (file) => {
  if (!file) return null;
  
  const storage = getStorage();
  const storageRef = ref(storage, `images/${file.name}-${new Date().toISOString()}`);
  
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  
  return url;
};

export default upload;

