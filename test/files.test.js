// eslint-disable-next-line import/no-extraneous-dependencies
const { google } = require('googleapis');

const listFiles = require('../src/files');

const { authorize } = require('../src/utils/auth');

jest.mock('googleapis');
jest.mock('../src/utils/auth');

describe('files.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a list of files on success', async () => {
    // Mock authorize to return a mock auth client
    const mockAuthClient = jest.fn();
    authorize.mockResolvedValue(mockAuthClient);

    const fileList = [
      { id: 'fileId1', name: 'file1.txt', mimeType: 'text/plain' },
      { id: 'fileId2', name: 'file2.txt', mimeType: 'text/plain' },
    ];

    const mockDriveList = jest.fn().mockResolvedValue({
      data: {
        files: fileList,
      },
    });

    google.drive.mockReturnValueOnce({ files: { list: mockDriveList } });

    const response = await listFiles.handler();

    expect(authorize).toHaveBeenCalledWith(
      process.env.GOOGLE_DRIVE_SERVICE_CLIENT_EMAIL,
      process.env.GOOGLE_DRIVE_SERVICE_CLIENT_PRIVATE_KEY,
      ['https://www.googleapis.com/auth/drive'],
    );

    expect(google.drive).toHaveBeenCalledWith({
      version: 'v3',
      auth: mockAuthClient,
    });

    expect(mockDriveList).toHaveBeenCalledWith({
      q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType)',
    });

    const parsedResponse = JSON.parse(response.body);

    expect(parsedResponse.type).toEqual('file');
    expect(parsedResponse.items).toEqual(fileList);
  });

  it('should return error if google throws error', async () => {
    // Mock authorize to return a mock auth client
    const mockAuthClient = jest.fn();
    authorize.mockResolvedValue(mockAuthClient);

    const errorsFromGoogleDrive = [
      { message: 'Something went wrong', domain: 'global' },
    ];
    const mockDriveList = jest.fn().mockRejectedValue({
      response: {
        data: {
          error: {
            errors: errorsFromGoogleDrive,
          },
        },
      },
    });
    google.drive.mockReturnValueOnce({ files: { list: mockDriveList } });

    // Call the handler function
    const response = await listFiles.handler();

    expect(authorize).toHaveBeenCalledWith(
      process.env.GOOGLE_DRIVE_SERVICE_CLIENT_EMAIL,
      process.env.GOOGLE_DRIVE_SERVICE_CLIENT_PRIVATE_KEY,
      ['https://www.googleapis.com/auth/drive'],
    );

    expect(google.drive).toHaveBeenCalledWith({
      version: 'v3',
      auth: mockAuthClient,
    });

    expect(mockDriveList).toHaveBeenCalledWith({
      q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType)',
    });

    const parsedResponse = JSON.parse(response.body);

    expect(parsedResponse.errors).toEqual(errorsFromGoogleDrive);
  });

  it('should return error for any internal errors', async () => {
    const mockAuthClient = jest.fn();
    authorize.mockResolvedValue(mockAuthClient);

    google.drive.mockReturnValueOnce(new Error('Something went wrong'));

    const response = await listFiles.handler();

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
