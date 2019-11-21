let id = 1;

function serialize(type, payload) {
  const action = { type, payload, id };

  id = id + 1;

  return JSON.stringify(action);
}

module.exports = { serialize };
