const uuidSet = new Set();

function generateId() {
  return (Math.random() * Math.pow(2, 32 - 1) >>> 0) + '';
}

export default function generateUniqueId() {
  let id = generateId();
  while (uuidSet.has(id)) {
    id = generateId();
  }
  uuidSet.add(id);
  return id;
}
