const { Kafka } = require('kafkajs');
const exitHook = require('async-exit-hook');
const { logger } = require('./logging');
const { eachMessage } = require('./handler');

const clientId = process.env.SERVICE_NAME || 'ingester';

const kafka = new Kafka({
  logLevel: 0,
  clientId,
  brokers: (process.env.KAFKA_BROKERS || '').replace(/\s/, '').split(','),
});

const consumer = kafka.consumer({
  groupId: process.env.KAFKA_CONSUMER_GROUP_ID,
});

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: process.env.KAFKA_TOPIC, fromBeginning: false });

  await consumer.run({
    eachMessage,
  });
};

run().catch(logger.error);

exitHook(async () => {
  logger.info('going down...');

  await consumer.disconnect();
});
