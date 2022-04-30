const nodemailer = require("nodemailer");
const Clients = require('../../models/clients');

let send = async(pdf, notification)=>{
  return new Promise(async (resolve, reject) => {
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth:{
        user: "jasmirzaev@gmail.com",
        pass: "googlejas13"
      }
    });

    let client = await Clients.findOne({ where: {id: notification.client_id} });

    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });
    console.log(notification)
    resolve(notification)
    let mailOptions = {
      from: `"GBH" <no-reply@gbh-vita.uz>`,
      to: 'jasmirzaev@gmail.com',/*, hbrokerage@mail.ru',*/
      subject: notification.tractor+( notification.trailer ? (` / `+notification.trailer) : (``)),
      text: `Клиент: `+client.first_name+` `+client.last_name+`, Транспорт: `+ notification.tractor+( notification.trailer ? (` / `+notification.trailer) : (``)),
      attachments : [{ filename: `${notification.tractor} ${notification.doc_number}.pdf`, path: pdf.path }]
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error)
        reject(error);
      } else {
        resolve(info.response)
      }
    });
  });
}

module.exports = { send }