module.exports = function Parser (respData, temp, fastText){
  temp = fastText.indexOf("Номер документа");
  fastText = fastText.slice(temp+15, fastText.length);

  temp = fastText.indexOf("Пограничные станции перехода");
  if(temp>-1){
    respData.doc_number = fastText.slice(0, temp).trim();
    fastText = fastText.slice(temp+28, fastText.length);
  } else {
    temp = fastText.indexOf("Таможенный пост въезда");
    respData.doc_number = fastText.slice(0, temp).trim();
    fastText = fastText.slice(temp+22, fastText.length);
  }
  

  temp = fastText.indexOf("Дата входа");
  respData.customs_entry = fastText.slice(0, temp).trim();
  fastText = fastText.slice(temp+10, fastText.length);

  temp = fastText.indexOf("Государственный номер ABTO:");
  respData.date_entry = fastText.slice(0, temp).trim();
  fastText = fastText.slice(temp+27, fastText.length);
  
  temp = fastText.indexOf("Номер прицепа");
  respData.tractor='';
  respData.trailer='';
  respData.transport='';
  if(temp>-1){
    respData.tractor = fastText.slice(0, temp).trim();
    fastText = fastText.slice(temp+14, fastText.length);  
  
    temp = fastText.indexOf("Номер контейнера");
    respData.trailer = fastText.slice(0, temp).trim();
    fastText = fastText.slice(temp+16, fastText.length);
  } else {
    temp = fastText.indexOf("Номер контейнера");
    respData.transport = fastText.slice(0, temp).trim();
    respData.tractor = respData.transport.split(" ")[0];
    respData.trailer = respData.transport.split(" ")[1];
    fastText = fastText.slice(temp+16, fastText.length);
  }
  temp = fastText.indexOf("Номер VIN Перевозчик");
  if(temp>-1){
    respData.vin = fastText.slice(0, temp).trim();
    fastText = fastText.slice(temp+10, fastText.length);

    temp = fastText.indexOf("Перевозчик");
    fastText = fastText.slice(temp+10, fastText.length);
  } else {
    temp = fastText.indexOf("Номер VIN");
    fastText = fastText.slice(temp+10, fastText.length);

    temp = fastText.indexOf("Перевозчик");
    respData.vin = fastText.slice(0, temp).trim();
    fastText = fastText.slice(temp+10, fastText.length);
  }
  
  temp = fastText.indexOf("Водитель");
  respData.carrier = fastText.slice(0, temp).trim();
  fastText = fastText.slice(temp+8, fastText.length);
  
  temp = fastText.indexOf("Номер и серия паспорта");
  respData.driver = fastText.slice(0, temp).trim();
  fastText = fastText.slice(temp+22, fastText.length);
  
  temp = fastText.indexOf("ПИНФЛ");
  respData.passport = fastText.slice(0, temp).trim();
  fastText = fastText.slice(temp+5, fastText.length);
  
  temp = fastText.indexOf("Исчисленные сборы");
  respData.pinfl = fastText.slice(0, temp).trim();
  fastText = fastText.slice(temp+17, fastText.length);

  temp = fastText.indexOf("Состояние сбора");
  respData.fees = fastText.slice(0, temp).trim();
  fastText = fastText.slice(temp+15, fastText.length);

  
  temp = fastText.indexOf("Номер партии"); //Номер партии
  let secrets = fastText.slice(0, temp); // от состояния сбора до партии
  let guaranteeType='';
  let guaranteeNumber='';
  secrets = secrets.trim().split(" ");
  if((secrets[0]=='Вид')){ //
    if((secrets[3]=='Номер')){ //standart
      if(secrets[secrets.length-1]=='гарантии' && secrets.length<6){
        guaranteeNumber = secrets[2];
      } else {
        guaranteeType = secrets[2];
        guaranteeNumber = secrets[5];
      }
    }
    if((secrets[2]=='Номер')){ //standart
      if(secrets[4]){
        guaranteeNumber = secrets[4];
      }
    }
  } else {
    let flag4number = 0;
    for(let i=0; i<secrets.length; i++){
      if(secrets[i]=='Вид'){
        for(let j=0; j<i; j++){
          guaranteeType += secrets[j]+' ';
        }
        guaranteeType = guaranteeType.trim();
        flag4number=i;
        break;
      }
    }
    if(secrets[flag4number+2]!='Номер'){
      for(let i=(flag4number+2); i<secrets.length; i++){
        if(secrets[i]=='Номер'){
          for(let j=(flag4number+2); j<i; j++){
            guaranteeNumber += secrets[j]+' ';
          }
          guaranteeNumber = guaranteeNumber.trim();
          break;
        }
      }
    }
    
  }
  respData.guaranteeType=guaranteeType;
  respData.guaranteeNumber=guaranteeNumber;
  
  temp = fastText.indexOf("Номер партии");
  if(temp>-1){
    fastText = fastText.slice(temp+13, fastText.length);
  } else {
    temp = fastText.indexOf("Количество партий");
    fastText = fastText.slice(temp+17, fastText.length);
  }
  
  
  temp = fastText.indexOf("Вес брутто");
  respData.consignments = fastText.slice(0, temp).trim();
  fastText = fastText.slice(temp+10, fastText.length);

  temp = fastText.indexOf("Фактурная стоимость");
  respData.brutto = fastText.slice(0, temp).trim();
  fastText = fastText.slice(temp+19, fastText.length);

  temp = fastText.indexOf("Декларант");
  respData.amount = fastText.slice(0, temp).trim();
  fastText = fastText.slice(temp+9, fastText.length);
  
  temp = fastText.indexOf("ID номер сведений");
  respData.declarant = fastText.slice(0, temp).trim();
  fastText = fastText.slice(temp+17, fastText.length);

  temp = fastText.indexOf("предоставленных сведений");
  fastText = fastText.slice(temp+24, fastText.length);

  respData.validity = fastText.slice(0, fastText.length).trim();
  respData.validity = respData.validity.split(".").reverse().join("-");
}