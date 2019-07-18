import * as Yup from 'yup';
import { Op } from 'sequelize';
import { parseISO, isBefore, format, startOfDay, endOfDay } from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
  async index(req, res) {
    const where = {};
    const page = req.query.page || 1;

    if (req.query.date) {
      const searchDate = req.query.date;
      const hourStart = parseISO(searchDate);
      const date = await format(hourStart, "dd'/'MMM'/'YYY', às' H:mm'h");

      where.date = {
        [Op.between]: [startOfDay(hourStart), endOfDay(hourStart)],
      };
    }

    const meetup = await Meetup.findAll({
      where,
      attributes: ['past', 'id', 'title', 'description', 'location', 'date'],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
      ],
      limit: 10,
      offset: 10 * page - 10,
    });

    return res.json(meetup);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      file_id: Yup.number().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: `Validation fails` });
    }

    if (isBefore(parseISO(req.query.date), new Date())) {
      return res.status(400).json({ error: `Past dates are not permitted` });
    }

    const user_id = req.userId;
    const { title, description, location, file_id } = req.body;

    const { date } = req.body;
    const transformDate = parseISO(date);
    const formatDate = await format(
      transformDate,
      "dd'/'MMM'/'YYY', às' H:mm'h"
    );

    await Meetup.create({
      ...req.body,
      user_id,
    });

    return res.json({
      user_id,
      file_id,
      title,
      description,
      location,
      date: formatDate,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      file_id: Yup.number().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    const user_id = req.userId;
    const meetup = await Meetup.findByPk(req.params.id);

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: `Validation fails` });
    }

    if (isBefore(parseISO(req.query.date), new Date())) {
      return res.status(400).json({ error: `Past dates are not permitted` });
    }

    if (meetup.user_id !== user_id) {
      return res.status(401).json({ error: `Not authorized` });
    }

    if (meetup.past === true) {
      return res.status(400).json({ error: `Can't update past meetups` });
    }

    const { title, description, location, file_id } = req.body;

    const { date } = req.body;
    const transformDate = parseISO(date);
    const formatDate = await format(
      transformDate,
      "dd'/'MMM'/'YYY', às' H:mm'h"
    );

    await meetup.update(req.body);

    return res.json({
      title,
      description,
      location,
      date: formatDate,
      file_id,
    });
  }

  async delete(req, res) {
    const user_id = req.userId;
    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== user_id) {
      return res.status(401).json({ error: `Not authorized` });
    }

    if (meetup.past === true) {
      return res.status(400).json({ error: `Can't delete past meetups` });
    }

    await meetup.destroy();

    return res.send(200);
  }
}

export default new MeetupController();
