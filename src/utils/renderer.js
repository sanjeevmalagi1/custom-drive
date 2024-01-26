async function render(statusCode, response) {
  return {
    statusCode,
    body: JSON.stringify(response),
  };
}

async function render200(response) {
  return render(200, response);
}

async function render400(response) {
  return render(400, response);
}

module.exports = {
  render,
  render200,
  render400,
};
