// helpers/chatRoom.js
function roomKey(a, b) {
  return [Number(a), Number(b)].sort((x, y) => x - y).join(":");
}
module.exports = { roomKey };
