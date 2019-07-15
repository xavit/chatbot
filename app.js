const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//port
const port = parseInt(process.env.PORT, 10) || 5000;
app.set('port', port);
// configurar el puerto y el mensaje en caso de exito
app.listen(port, () => console.log(`Server UP on PORT ${ port }`));

// Ruta de la pagina index
app.get("/", function (req, res) {
  res.send("ChatBot has been successfully deployed");
});

// Facebook Webhook

// Usados para la verificacion
app.get("/webhook", function (req, res) {
  // Verificar la coincidendia del token
  if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
    // Mensaje de exito y envio del token requerido
    console.log("Verified webhook!");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    // Mensaje de fallo
    console.error("The verification has failed, because the tokens do not match");
    res.sendStatus(403);
  }
});

// Todos eventos de mesenger sera apturados por esta ruta
app.post("/webhook", function (req, res) {
  // Verificar si el vento proviene del pagina asociada
  if (req.body.object == "page") {
    // Si existe multiples entradas entraas
    req.body.entry.forEach(function (entry) {
      // Iterara todos lo eventos capturados
      entry.messaging.forEach(function (event) {
        if (event.message) {
          process_event(event);
        }
      });
    });
    res.sendStatus(200);
  }
});


// Funcion donde se procesara el evento
function process_event (event) {
  // Capturamos los datos del que genera el evento y el mensaje 
  var senderID = event.sender.id;
  var message = event.message;

  // Si en el evento existe un mensaje de tipo texto
  if (message.text) {
    // Crear un payload para un simple mensaje de texto
    var response = {
      "text": 'You sent this message: ' + message.text
    }
  }

  // Enviamos el mensaje mediante SendAPI
  enviar_texto(senderID, response);
}

// Funcion donde el chat respondera usando SendAPI
function enviar_texto (senderID, response) {
  // Construcicon del cuerpo del mensaje
  let request_body = {
    "recipient": {
      "id": senderID
    },
    "message": response
  }

  // Enviar el requisito HTTP a la plataforma de messenger
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('Message sent!')
    } else {
      console.error("Message not sent: " + err);
    }
  });
}