import { Kafka } from 'kafkajs';
import Chance from 'chance';
import myLogger from './winstonLog/winston.js';
import { json } from 'express';

const chace = new Chance();

const kafka = new Kafka({
    brokers:
        ['10.14.132.113:9092']
})

const consumer = kafka.consumer(
    {groupId: 'consumer-group', rackId: '1'});
const topic = 'helion';

const run = async () =>{
    await consumer.connect()
    await consumer.subscribe({topic})
    await consumer.run({
        eachMessage: async({
            topic, partition, message
        }) =>{
            // let a = JSON.parse(message)
            myLogger.info("This is log ===== %o", JSON.parse(message.value.toString()))
            // console.log({
            //     partition, 
            //     offset: message.offset,
            // })
            
            process.exit();
        }
    })
}
run().catch(console.error)