function handlerError(errorResponse) {
  if (errorResponse?.response?.data?.error?.errors) {
    return {
      errors: errorResponse.response.data.error.errors,
    };
  }

  if (errorResponse?.response?.data?.error) {
    return {
      errors: [
        {
          domain: 'strc-drive',
          message: errorResponse.response.data.error,
        },
      ],
    };
  }

  return {
    errors: [
      {
        domain: 'strc-drive',
        message: 'unable to process request',
      },
    ],
  };
}

module.exports = {
  handlerError,
};
