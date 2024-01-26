const { google } = require('googleapis');

async function authorize(clientEmail, privateKey, SCOPE) {
  const jwtClient = new google.auth.JWT(
    clientEmail,
    null,
    privateKey,
    SCOPE,
  );

  await jwtClient.authorize();

  return jwtClient;
}

module.exports = {
  authorize,
};
