// eslint-disable-next-line import/no-extraneous-dependencies
const { google } = require('googleapis');

const { authorize } = require('./utils/auth');
const { render200, render400 } = require('./utils/renderer');
const { handlerError } = require('./utils/error_handler');

const SCOPE = ['https://www.googleapis.com/auth/drive'];
const clientEmail = process.env.GOOGLE_DRIVE_SERVICE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_DRIVE_SERVICE_CLIENT_PRIVATE_KEY;

module.exports.handler = async (event) => {
  try {
    const currentFileId = event.pathParameters?.file_id;

    const authClient = await authorize(clientEmail, privateKey, SCOPE);

    const drive = google.drive({ version: 'v3', auth: authClient });

    const driveRes = await drive.permissions.list({
      fileId: currentFileId,
      fields: 'permissions(id, emailAddress, role, type)',
    });

    const { permissions } = driveRes.data;

    const usersWithAccess = permissions.filter((permission) => permission.type === 'user');

    const response = {
      items: usersWithAccess,
      type: 'user',
    };

    return render200(response);
  } catch (errorResponse) {
    const response = handlerError(errorResponse);
    return render400(response);
  }
};
