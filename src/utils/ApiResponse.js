export class ApiResponse {
  static success(data, meta = null) {
    const response = {
      success: true,
      data,
    };

    if (meta) {
      response.meta = meta;
    }

    return response;
  }

  static error(message, code = 500, details = null) {
    const response = {
      success: false,
      error: {
        message,
        code,
      },
    };

    if (details) {
      response.error.details = details;
    }

    return response;
  }

  static paginated(data, page, limit, total) {
    return this.success(data, {
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }
}
