// eslint-disable-next-line import/no-extraneous-dependencies
const { google } = require('googleapis');

const users = require('../src/users');

const { authorize } = require('../src/utils/auth');

jest.mock('googleapis');
jest.mock('../src/utils/auth');

describe('users.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return list of users with their permissions', async () => {
    const mockAuthClient = jest.fn();
    authorize.mockResolvedValue(mockAuthClient);

    const fileId = '12341';

    const event = {
      pathParameters: {
        file_id: fileId,
      },
    };

    const permissions = [{
      id: 'dummy-id',
      emailAddress: 'dummy_email@email.com',
      role: 'User',
      type: 'user',
    }];

    const mockDrivePermissions = jest.fn().mockResolvedValue({
      data: {
        permissions,
      },
    });

    google.drive.mockReturnValueOnce({ permissions: { list: mockDrivePermissions } });

    const response = await users.handler(event);

    expect(authorize).toHaveBeenCalledWith(
      process.env.GOOGLE_DRIVE_SERVICE_CLIENT_EMAIL,
      process.env.GOOGLE_DRIVE_SERVICE_CLIENT_PRIVATE_KEY,
      ['https://www.googleapis.com/auth/drive'],
    );

    expect(google.drive).toHaveBeenCalledWith({
      version: 'v3',
      auth: mockAuthClient,
    });

    expect(mockDrivePermissions).toHaveBeenCalledWith({
      fileId,
      fields: 'permissions(id, emailAddress, role, type)',
    });

    const parsedResponse = JSON.parse(response.body);

    expect(parsedResponse.items).toEqual(permissions);
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

    const mockDrivePermissions = jest.fn().mockRejectedValue({
      response: {
        data: {
          error: {
            errors: errorsFromGoogleDrive,
          },
        },
      },
    });

    google.drive.mockReturnValueOnce({ permissions: { list: mockDrivePermissions } });

    const response = await users.handler(event);

    expect(authorize).toHaveBeenCalledWith(
      process.env.GOOGLE_DRIVE_SERVICE_CLIENT_EMAIL,
      process.env.GOOGLE_DRIVE_SERVICE_CLIENT_PRIVATE_KEY,
      ['https://www.googleapis.com/auth/drive'],
    );

    expect(google.drive).toHaveBeenCalledWith({
      version: 'v3',
      auth: mockAuthClient,
    });

    expect(mockDrivePermissions).toHaveBeenCalledWith({
      fileId,
      fields: 'permissions(id, emailAddress, role, type)',
    });

    const parsedResponse = JSON.parse(response.body);

    expect(parsedResponse.errors).toEqual(errorsFromGoogleDrive);
  });

  it('should return error for any internal errors', async () => {
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

    const response = await users.handler(event);

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
