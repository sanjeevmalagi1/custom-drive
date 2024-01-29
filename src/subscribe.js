// eslint-disable-next-line import/no-extraneous-dependencies
const { google } = require('googleapis');

const { authorize } = require('./utils/auth');
const { render200, render400 } = require('./utils/renderer');
const { handlerError } = require('./utils/error_handler');

const SCOPE = ['https://www.googleapis.com/auth/drive'];
const clientEmail = process.env.GOOGLE_DRIVE_SERVICE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_DRIVE_SERVICE_CLIENT_PRIVATE_KEY;
const baseUrl = process.env.STRAC_DRIVE_BASE_URL;

module.exports.handler = async (event) => {
  try {
    const currentFileId = event.pathParameters?.file_id;

    const authClient = await authorize(clientEmail, privateKey, SCOPE);

    const drive = google.drive({ version: 'v3', auth: authClient });

    const webhookUrl = `${baseUrl}/api/v1/file/${currentFileId}/webhook`;

    await drive.files.watch({
      fileId: currentFileId,
      changes: ['permission'],
      requestBody: {
        kind: 'drive#change',
        id: `${currentFileId}_callback_id`,
        type: 'webhook',
        address: webhookUrl,
      },
    });

    const response = {
      item: 'Successfully subscribed to changes',
      type: 'subscribe',
    };

    return render200(response);
  } catch (errorResponse) {
    const response = handlerError(errorResponse);
    return render400(response);
  }
};
