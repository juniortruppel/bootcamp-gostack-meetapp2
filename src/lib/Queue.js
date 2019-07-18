import Bee from 'bee-queue';
import SubscriptionMail from '../app/jobs/SubscriptionMail';
import redisConfig from '../config/redis';

const jobs = [SubscriptionMail];

class Queue {
  constructor() {
    this.queues = {};
    this.init();
  }

  // this.queues is saving all the content bellow
  // Store each job
  // Store the connection with redis
  // Store the handle, the task that will be called to send each email
  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  add(queue, job) {
    // Add a new job inside redis
    return this.queues[queue].bee.createJob(job).save();
  }

  processQueue() {
    // When a new job is added by the method above, the processQueue process the job in real time and in background
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
