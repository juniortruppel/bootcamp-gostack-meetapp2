import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class SubscriptionMail {
  // When we use "import SubscriptionMail from '..'", with get key, we can do SubscriptionMail.key and we dont need to create a constructor
  get key() {
    return 'SubscriptionMail'; // Each job needs a unique key
  }

  async handle({ data }) {
    const { meetup, user } = data;

    console.log('A fila executou!!!');
    // Handle is the task that will be called to send each email
    await Mail.sendMail({
      to: `${meetup.User.name} <${meetup.User.email}>`,
      subject: `[${meetup.title}] Nova inscrição`,
      template: 'subscription',
      context: {
        name: meetup.User.name,
        title: meetup.title,
        description: meetup.description,
        location: meetup.location,
        date: format(parseISO(meetup.date), "dd'/'MMM'/'YYY', às' H:mm'h", {
          locale: pt,
        }),
        user: user.name,
        email: user.email,
      },
    });
  }
}

export default new SubscriptionMail();
