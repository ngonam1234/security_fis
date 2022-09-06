
import mqtt from 'mqtt';

let client = mqtt.connect('mqtt://180.93.175.236')
client.on("connect", function () {
    console.log("connected");
})

export function publicMobile(data) {
    client.publish("mobile", JSON.stringify(data))
}