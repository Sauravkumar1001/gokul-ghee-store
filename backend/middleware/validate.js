import { ApiError } from '../utils/ApiError.js';

export function validate(schema, target = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new ApiError(400, details[0]?.message || 'Invalid request input.', details));
    }

    req[target] = result.data;
    return next();
  };
}
