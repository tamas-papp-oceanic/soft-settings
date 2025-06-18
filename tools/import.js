import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const createConfig = (nam) => {
  let inf = '/home/tamas/go/src/git/poseidon/kratos/default/' + nam + '.json'
  if (existsSync(inf)) {
    const txt = readFileSync(inf);
    if (nam == "prop2000") {
      nam = "nmea2000";
    }
    let inp = JSON.parse(txt);
    let out = {}
    out[nam] = new Array();
    for (let i in inp) {
      let dat = inp[i];
      let rec = {
        "dataId": dat.pgn,
        "title": dat.description,
        "fields": new Array(),
        "route": nam + "/data/{busNumber}/by_dataid/" + dat.pgn + "/{field}"
      };
      for (let j in dat.fields) {
        let fld = dat.fields[j];
        let tmp = {
          "field": fld.field,
          "title": fld.description,
        };
        if (fld.hasOwnProperty("instance") && fld.instance) {
          rec.route = nam + "/data/{busNumber}/by_instance/{instance}/" + dat.pgn + "/{field}";
        }
        if (fld.hasOwnProperty("unit") && (fld.unit != null)) {
          tmp.unit = fld.unit;
        }
        rec.fields.push(tmp);
      }
      if ((dat.pgn == "061184") || ((dat.pgn >= "065280") && (dat.pgn <= "065535")) ||
        (dat.pgn == "126720") || ((dat.pgn >= "130816") && (dat.pgn <= "131071"))) {
        rec.manufacturer = dat.manufacturer;
        rec.route = nam + "/data/{busNumber}/by_manufacturer_dataid/" + dat.manufacturer + "/" + dat.pgn + "/{field}"
      }
      if (dat.hasOwnProperty("function") && (dat.function != null)) {
        rec.function = dat.function;
        if (rec.hasOwnProperty("manufacturer")) {
          rec.route = nam + "/data/{busNumber}/by_manufacturer_function/" + dat.manufacturer + "/" + dat.pgn + "/" + dat.function + "/{field}"
        } else {
          rec.route = nam + "/data/{busNumber}/by_function/"+ dat.pgn + "/" + dat.function + "/{field}"
        }
      }
      if (dat.pgn == "127505") {
        for (let k = 0; k < 7; k++) {
          let tmp = JSON.parse(JSON.stringify(rec))
          tmp.group = k;
          switch (k) {
            case 0:
              tmp.title = "Fuel level";
              break;                  
            case 1:
              tmp.title = "Fresh Water level";
              break;                  
            case 2:
              tmp.title = "Waste Water level";
              break;                  
            case 3:
              tmp.title = "Live Well level";
              break;                  
            case 4:
              tmp.title = "Oil level";
              break;                  
            case 5:
              tmp.title = "Black Water (Sewage) level";
              break;                  
            case 6:
              tmp.title = "Fuel (Gasoline) level";
              break;                  
          }
          tmp.route = nam + "/data/{busNumber}/by_fluid_instance/" + k + "/{instance}/" + dat.pgn + "/{field}"
          out[nam].push(tmp);
        }
      } else {
        out[nam].push(rec);
      }
    }
    return out;
  }
  return null;
};

const saveConfig = (nam, dat) => {
  let ouf = '../config/' + nam + '.json'
  try {
    writeFileSync(ouf, JSON.stringify(dat, null, 2));
  } catch (err) {
    console.error(err);
  }
}

// MAIN

let dat1 = createConfig('j1939');
let dat2 = createConfig('nmea2000');
let dat3 = createConfig('prop2000');
if ((dat1 != null) && (dat2 != null) && (dat3 != null)) {
  saveConfig('j1939', dat1);

  let dat4 = {'nmea2000': dat2['nmea2000'].concat(dat3['nmea2000'])};
  saveConfig('nmea2000', dat4);
}
