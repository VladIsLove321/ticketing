import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Password } from "../services/password";
import { BadRequestError, validateRequest } from "@vladislovetickets/common";
import { User } from "../models/users";
import jwt from "jsonwebtoken";
const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("email must be valid"),
    body("password").trim().notEmpty().withMessage("You must apply a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequestError("No such user");
    }
    if (!(await Password.compare(user.password, password))) {
      throw new BadRequestError("Wrong password");
    }
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJwt,
    };
    res.status(200).send(user);
  }
);

export { router as signinRouter };
