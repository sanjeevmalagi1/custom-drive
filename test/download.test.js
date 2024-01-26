// eslint-disable-next-line import/no-extraneous-dependencies
const { google } = require('googleapis');

const download = require('../src/download');

const { authorize } = require('../src/utils/auth');

jest.mock('googleapis');
jest.mock('../src/utils/auth');

describe('download.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return downloadUrl on success', async () => {
    const mockAuthClient = jest.fn();
    authorize.mockResolvedValue(mockAuthClient);

    const fileId = '12341';
    const expectedDownloadUrl = 'dummy_value';

    const event = {
      pathParameters: {
        file_id: fileId,
      },
    };

    const mockDriveResponse = jest.fn().mockResolvedValue({
      data: {
        webContentLink: expectedDownloadUrl,
      },
    });

    google.drive.mockReturnValueOnce({ files: { get: mockDriveResponse } });

    const response = await download.handler(event);

    expect(authorize).toHaveBeenCalledWith(
      process.env.GOOGLE_DRIVE_SERVICE_CLIENT_EMAIL,
      process.env.GOOGLE_DRIVE_SERVICE_CLIENT_PRIVATE_KEY,
      ['https://www.googleapis.com/auth/drive'],
    );

    expect(google.drive).toHaveBeenCalledWith({
      version: 'v3',
      auth: mockAuthClient,
    });

    expect(mockDriveResponse).toHaveBeenCalledWith({
      fileId,
      fields: 'webContentLink',
    });

    const parsedResponse = JSON.parse(response.body);

    expect(parsedResponse.item).toEqual(expectedDownloadUrl);
  });

  it('should return error if google drive throws error', async () => {
    const fileId = '12341';

    const event = {
      pathParameters: {
        file_id: fileId,
      },
    };

    const mockAuthClient = jest.fn();
    authorize.mockResolvedValue(mockAuthClient);

    const errorsFromGoogleDrive = [
      { message: 'Something went wrong', domain: 'global' },
    ];

    const mockDriveResponse = jest.fn().mockRejectedValue({
      response: {
        data: {
          error: {
            errors: errorsFromGoogleDrive,
          },
        },
      },
    });

    google.drive.mockReturnValueOnce({ files: { get: mockDriveResponse } });

    const response = await download.handler(event);

    expect(authorize).toHaveBeenCalledWith(
      process.env.GOOGLE_DRIVE_SERVICE_CLIENT_EMAIL,
      process.env.GOOGLE_DRIVE_SERVICE_CLIENT_PRIVATE_KEY,
      ['https://www.googleapis.com/auth/drive'],
    );

    expect(google.drive).toHaveBeenCalledWith({
      version: 'v3',
      auth: mockAuthClient,
    });

    expect(mockDriveResponse).toHaveBeenCalledWith({
      fileId,
      fields: 'webContentLink',
    });

    const parsedResponse = JSON.parse(response.body);

    expect(parsedResponse.errors).toEqual(errorsFromGoogleDrive);
  });

  it('should return error if internal error', async () => {
    // Mock authorize to return a mock auth client
    const fileId = '12341';

    const event = {
      pathParameters: {
        file_id: fileId,
      },
    };

    const mockAuthClient = jest.fn();
    authorize.mockResolvedValue(mockAuthClient);

    google.drive.mockReturnValueOnce(new Error('Something went wrong'));

    const response = await download.handler(event);

    expect(authorize).toHaveBeenCalledWith(
      process.env.GOOGLE_DRIVE_SERVICE_CLIENT_EMAIL,
      process.env.GOOGLE_DRIVE_SERVICE_CLIENT_PRIVATE_KEY,
      ['https://www.googleapis.com/auth/drive'],
    );

    expect(google.drive).toHaveBeenCalledWith({
      version: 'v3',
      auth: mockAuthClient,
    });

    const parsedResponse = JSON.parse(response.body);

    expect(parsedResponse.errors).toEqual([{ domain: 'strc-drive', message: 'unable to process request' }]);
  });
});
