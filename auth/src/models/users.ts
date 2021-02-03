import mongoose, { Schema, Document, model } from "mongoose";
import { Password } from "../services/password";

interface UserAttrs {
  email: string;
  password: string;
}

type UserDoc = Document & UserAttrs;

const userSchema = new Schema<UserDoc>(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      },
      versionKey: false,
    },
  }
);

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

const UserModel = model<UserDoc>("User", userSchema);

export class User extends UserModel {
  constructor(attrs: UserAttrs) {
    super(attrs);
  }
}

const user = new User({
  email: "test@test.com",
  password: "password",
});
