import { Kafka } from 'kafkajs';
import Chance from 'chance';
import myLogger from './winstonLog/winston.js';
import { json } from 'express';

const chace = new Chance();

const kafka = new Kafka({
    brokers:
        ['10.14.132.113:9092']
})

const consumer = kafka.consumer({groupId: 'consumer-group'});
const topic = 'helion';

const run = async () =>{
    await consumer.connect()
    await consumer.subscribe({topic})
    await consumer.run({
        eachMessage: async({
            topic, partition, message
        }) =>{
            console.log({
                partition, 
                offset: message.offset,
                value: message.value.toString(),
                
            })
        }
    })
}
run().catch(console.error)