const myErrorHandler = (myErrorFun) => (req, resp, next) => {
  Promise.resolve(myErrorFun(req, resp, next)).catch((error) => {
    next(error);
  });
};

module.exports = myErrorHandler;
