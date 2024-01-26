const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');

// eslint-disable-next-line no-unused-vars
module.exports = async ({ options, resolveVariable }) => {
  const stage = await resolveVariable('self:provider.stage');
  const region = await resolveVariable('self:provider.region');

  if (!(stage === 'dev' || stage === 'prod')) {
    // eslint-disable-next-line no-console
    console.log('Unknown environment. Using env vars from .env file');
    return {};
  }

  const vars = {
    GOOGLE_DRIVE_SERVICE_CLIENT_EMAIL: 'dummy',
    GOOGLE_DRIVE_SERVICE_CLIENT_PRIVATE_KEY: 'dummy',
    GOOGLE_DRIVE_FOLDER_ID: 'dummy',
  };

  // eslint-disable-next-line no-console
  console.log(`Retriving env vars for ${stage}`);

  const parameter = `strac-${stage}-env`;

  const client = new SSMClient({ region });

  const command = new GetParameterCommand({
    Name: parameter,
    WithDecryption: true,
  });
  const res = await client.send(command);

  if (!res.Parameter) {
    return 'Unable to retrieve from parameter-store';
  }

  const value = res.Parameter.Value || '';

  const params = JSON.parse(value);

  const keys = Object.keys(params);

  const missingParams = Object.keys(vars).filter((name) => !keys.includes(name));
  if (missingParams.length) {
    throw new Error(
      `Missing params in '${parameter}': ${missingParams.join(' ')}`,
    );
  }
  return params;
};
