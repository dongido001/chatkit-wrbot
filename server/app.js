const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Chatkit = require("@pusher/chatkit-server");
const resolve = require("path").resolve;

require("dotenv").config({ path: resolve(__dirname, "../.env") });

const app = express();
const port = process.env.APP_PORT;

// Initialises chatkit client
const chatkit = new Chatkit.default({
  instanceLocator: process.env.VUE_APP_CHATKIT_INSTANCE_LOCATOR,
  key: process.env.CHATKIT_SECRET_KEY
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/welcome_webhook", async (req, res) => {
   const room_id = req.body.payload.room.id;
   const room_name = req.body.payload.room.name;
   const user_name = req.body.payload.user.name;

   const welcome_message = `
    Hi ${user_name}! 🎉🎉, You are welcome to ${room_name}.
    We are really glad to have you here.`;

   // Return response early - see https://pusher.com/docs/chatkit/webhooks#retry-strategy
   res.sendStatus(200);
   
   wrbotSendMessage(room_id, welcome_message)
    .then(response => console.log(response))
    .catch(error => console.log(error));
});

app.get("/get_rooms", (req, res) => {
  chatkit
    .getRooms({})
    .then(rooms => {
      res.status(200).send({
        status: "success",
        data: rooms
      });
    })
    .catch(err => {
      res.status(200).send({
        status: "error",
        message: err
      });
    });
});

function wrbotSendMessage(roomId, message) {
  return chatkit.sendSimpleMessage({
    userId: "wrbot",
    roomId: roomId,
    text: message
  });
}

app.get("/", async (req, res) => {
  res.send({ hello: "World!" });
});

app.listen(port, () => console.log(`Node app listening on port ${port}!`));
