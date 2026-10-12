export const successResponse = (res, data, message = "Success") => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, message = "Error", status = 400) => {
  return res.status(status).json({
    success: false,
    message,
  });
};


export const sendSuccess = (res, message, data = null, statusCode = 200) => {
  res.status(statusCode).json({ success: true, message, data });
};

export const sendError = (res, message, statusCode = 400) => {
  res.status(statusCode).json({ success: false, message });
};
