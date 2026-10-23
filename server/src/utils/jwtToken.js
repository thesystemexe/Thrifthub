const sendToken = (user, statusCode, resp, tokenName) => {
  const token = user.getToken();

  //options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.EXPIRE_COOKIE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  resp.status(statusCode).cookie(tokenName, token, options).json({
    success: true,
    user,
    token,
  });
};

module.exports = sendToken;
