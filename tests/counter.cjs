"use strict";
const assert = require("node:assert/strict");
const { calendarDifference } = require("../script.js");
const cases = [
  ["inicio", "2026-07-25T14:40:00-06:00", [0,0,0,0,0,0]],
  ["un segundo", "2026-07-25T14:40:01-06:00", [0,0,0,0,0,1]],
  ["cambio de minuto", "2026-07-25T14:41:00-06:00", [0,0,0,0,1,0]],
  ["cambio de hora", "2026-07-25T15:40:00-06:00", [0,0,0,1,0,0]],
  ["un día", "2026-07-26T14:40:00-06:00", [0,0,1,0,0,0]],
  ["antes de mes", "2026-08-25T14:39:59-06:00", [0,0,30,23,59,59]],
  ["un mes", "2026-08-25T14:40:00-06:00", [0,1,0,0,0,0]],
  ["mes de 30 días", "2026-10-25T14:40:00-06:00", [0,3,0,0,0,0]],
  ["cambio de año", "2027-01-01T00:00:00-06:00", [0,5,6,9,20,0]],
  ["antes del aniversario", "2027-07-25T14:39:59-06:00", [0,11,29,23,59,59]],
  ["un año", "2027-07-25T14:40:00-06:00", [1,0,0,0,0,0]],
  ["febrero normal", "2027-03-01T14:40:00-06:00", [0,7,4,0,0,0]],
  ["29 de febrero", "2028-02-29T14:40:00-06:00", [1,7,4,0,0,0]],
  ["febrero bisiesto", "2028-03-01T14:40:00-06:00", [1,7,5,0,0,0]],
  ["diez años", "2036-07-25T14:40:00-06:00", [10,0,0,0,0,0]],
  ["2100 no es bisiesto", "2100-03-01T14:40:00-06:00", [73,7,4,0,0,0]],
  ["fin de mes", "2027-02-28T14:40:00-06:00", [0,1,0,0,0,0], "2027-01-31T14:40:00-06:00"],
  ["sin recorte acumulado", "2027-03-31T14:40:00-06:00", [0,2,0,0,0,0], "2027-01-31T14:40:00-06:00"],
  ["aniversario bisiesto", "2029-02-28T14:40:00-06:00", [1,0,0,0,0,0], "2028-02-29T14:40:00-06:00"]
];
const keys = ["years","months","days","hours","minutes","seconds"];
for (const [name, now, expected, start] of cases) {
  const result = calendarDifference(new Date(now), start ? new Date(start) : undefined);
  assert.deepEqual(keys.map(key => result[key]), expected, name);
}
assert.equal(calendarDifference(new Date("2026-07-25T14:39:59-06:00")).future, true);
assert.deepEqual(
  calendarDifference(new Date("2027-07-25T20:40:00Z")),
  calendarDifference(new Date("2027-07-26T05:40:00+09:00"))
);
console.log("21 pruebas de calendario correctas.");
