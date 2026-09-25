// Renames Mongo's _id -> id and strips __v, so the frontend (written against
// the mock data's `.id` fields) needs no changes when reading API responses.
export function toJSONPlugin(schema) {
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
  });
}
