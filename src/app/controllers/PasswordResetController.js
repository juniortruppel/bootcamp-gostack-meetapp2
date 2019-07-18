import * as Yup from 'yup';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import authConfig from '../../config/auth';

class PasswordResetController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: `Validation Fails!` });

    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(400).json({ error: `User not found!` });

    const { id } = user;

    const usePasswordHashToMakeToken = () =>
      jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      });

    const token = usePasswordHashToMakeToken();

    return res.json({ reset_url: token });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      password: Yup.string()
        .min(6)
        .required(),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: `Validation Fails!` });

    const { token } = req.params;
    const { id } = jwt.decode(token);

    const user = await User.findOne({ where: { id } });

    if (!user) return res.status(400).json({ error: `User not found!` });

    try {
      await promisify(jwt.verify)(token, authConfig.secret);
    } catch (err) {
      return res.status(401).json({ error: `Invalid token` });
    }

    const { password } = req.body;
    const password_hash = await bcrypt.hash(password, 8);

    await user.update({ password_hash });

    return res.json({ message: `Password successfully updated` });
  }
}

export default new PasswordResetController();
