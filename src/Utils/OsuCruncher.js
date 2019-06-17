module.exports = (key, data) => {
  if (data !== null || data !== undefined) {
    if (typeof data === "boolean") {
      return `${key}: ${+data}`;
    } else if (Array.isArray(data)) {
      if (data.length === 0) return null;
      return `${key}: ${key === "Tags" ? data.join(" ") : data.join(",")}`;
    } else {
      return `${key}: ${data}`;
    }
  }
  return null;
};
