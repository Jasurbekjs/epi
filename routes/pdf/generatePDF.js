const pdf = require('html-pdf');
const fs = require('fs');
const QRCode = require('qrcode')

let generatePDF = async (notification) => {

  return new Promise(async (resolve, reject) => {
    await QRCode.toDataURL(notification.doc_number, function (err, qr) {
      let filePath = __dirname+'/'+notification.tractor+' '+notification.doc_number+'.pdf';
      let textPDF = generateText(qr, notification);
      pdf.create(textPDF, {}).toFile(filePath, (err, pdf) => {
        if(err){ reject(err); }
        const content = fs.readFileSync(filePath, {encoding: 'base64'});
        let result = {
          content : content,
          path : filePath
        }
        resolve(result);
      })
    })    
    
  })
}

let generateText = (qr, notification) => {
  notification.doc_number = notification.doc_number ? notification.doc_number : '';
  notification.date_entry = notification.date_entry ? notification.date_entry : '';
  notification.tractor = notification.tractor ? notification.tractor : '';
  notification.trailer = notification.trailer ? notification.trailer : '';
  notification.container = notification.container ? notification.container : '';
  notification.vin = notification.vin ? notification.vin : '';
  notification.carrier = notification.carrier ? notification.carrier : '';
  notification.driver = notification.driver ? notification.driver : '';
  notification.passport = notification.passport ? notification.passport : '';
  notification.pinfl = notification.pinfl ? notification.pinfl : '';
  notification.fees = notification.fees ? notification.fees : '';
  notification.guaranteeType = notification.guaranteeType ? notification.guaranteeType : '';
  notification.guaranteeNumber = notification.guaranteeNumber ? notification.guaranteeNumber : '';
  notification.consignments = notification.consignments ? notification.consignments : '';
  notification.brutto = notification.brutto ? notification.brutto : '';
  notification.amount = notification.amount ? notification.amount : '';
  notification.declarant = notification.declarant ? notification.declarant : '';
  notification.doc_number = notification.doc_number ? notification.doc_number : '';
  notification.validity = notification.validity ? notification.validity : '';
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>EPI GBH</title><style>.main-border{border: 1px dashed #D8DFFC;}.center{text-align: center;}.border{border: 1px solid black;}</style></head><body style="zoom:0.7;padding: 20px 50px;font-family: 'Helvetica', 'Arial', sans-serif;font-weight: 500;-webkit-print-color-adjust: exact;box-sizing: border-box;"><div class="main-border"><table style="border-collapse: collapse; width: 100%;"><tr style="border-bottom: 1px solid #2552B8;"><td style="padding: 2% 0px 2% 5%; border-right: 1px solid #2552B8; width: 30%;"><strong style="color: #2552B8; font-size: 24px;">E-TRANZIT</strong></td><td><div style="padding-left: 6px;">Служба предварительной <br/>информации об <br/>автотранспортном средстве</div></td></tr><tr><td style="border-top: 1px solid #2552B8;"> </td><td style="border-top: 1px solid #2552B8;"> </td></tr><tr><td style="border-top: 1px solid #2552B8;"> </td><td style="border-top: 1px solid #2552B8;"> </td></tr></table><br/><br/><div style="text-align: center; font-size: 20px;">Предварительно декларационная информация о транспортном <br/>средстве</div><br/><br/><table style="border-collapse: collapse; width: 100%; border: 1px solid black; background-color: #F1EBDC;"><tr><td class="center border"><div>Номер документа</div><div><b>${notification.doc_number}</b></div></td><td class="center border" colspan="2"><div>Пограничные станции перехода</div><div><b>${notification.customs_entry}</b></div></td><td class="center border"><div>Дата входа</div><div><b>${notification.date_entry}</b></div></td></tr><tr><td class="center border"><div>Государственный номер</div><div><b>ABTO:</b></div><div><b>${notification.tractor}</b></div></td><td class="center border"><div><!-- Номер прицепа --></div><div><b>${notification.trailer}</b></div></td><td class="center border"><div>Номер контейнера</div><div>${notification.container}</div></td><td class="center border"><div>Номер VIN</div><div><b>${notification.vin}</b></div></td></tr><tr><td class="center border"><div>Перевозчик</div><div><b>${notification.carrier}</b></div></td><td class="center border"><div>Водитель</div><div><b>${notification.driver}</b></div></td><td class="center border"><div>Номер и серия <br/>паспорта</div><div><b>${notification.passport}</b></div></td><td class="center border"><div>ПИНФЛ</div><div><b>${notification.pinfl}</b></div></td></tr><tr><td class="center border"><div>Исчисленные сборы</div><div><b>${notification.fees}</b></div></td><td class="center border"><div>Состояние сбора</div><div><b></b></div></td><td class="center border"><div>Вид гарантии</div><div><b>${notification.guaranteeType}</b></div></td><td class="center border"><div>Номер гарантии</div><div><b>${notification.guaranteeNumber}</b></div></td></tr><tr><td class="center border"><div>Номер партии</div><div><b>${notification.consignments}</b></div></td><td class="center border"><div>Вес брутто</div><div><b>${notification.brutto}</b></div></td><td class="center border"><div>Фактурная <br/>стоимость</div><div><b>${notification.amount}</b></div></td><td class="center border"><div>Декларант</div><div><b>${notification.declarant}</b></div></td></tr></table><br/><br/><div class="center"><b>ID номер сведений.</b></div><div class="center"><b style="color: #5F0211; text-decoration: underline;">${notification.doc_number}</b></div><br/><br/><div class="center"><img src="${qr}" alt=""></div><br/><br/><br/><br/><div class="center" style="background-color: #F0F1F4; color: #2552B8">Внимание! Срок действия предоставленных сведений ${notification.validity}</div></div></body></html>`
}

module.exports = { generatePDF }