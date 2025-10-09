
/**
 * Barcode style libraries with Persian names and descriptions
 */
export const QRCodeStyleLibs = [
  { name: "A1", index: 0 },
  { name: "A2", index: 1 },
  { name: "A3", index: 2 },
  { name: "SP1", index: 3 },
  { name: "SP2", index: 4 },
  { name: "SP3", index: 5 },
  { name: "B1", index: 6 },
  { name: "C1", index: 7 },
  // {'name': 'C2', index: 8},
  { name: "A_a1", index: 9 },
  { name: "A_a2", index: 10 },
  { name: "A_b1", index: 11 },
  { name: "A_b2", index: 12 },
];
export const BarCodeStyleLibs = [
  {
    name: "CODE128",
    value: "CODE128",
    info: "Standardly used standard for all characters"
  },
  {
    name: "CODE128A",
    value: "CODE128A",
    info: "Only for large characters, numbers and special marks"
  },
  {
    name: "CODE128B",
    value: "CODE128B",
    info: "For large, small, numbers and marks"
  },
  {
    name: "CODE128C",
    value: "CODE128C",
    info: "Only for pair numbers"
  },
  {
    name: "EAN13",
    value: "EAN13",
    info: "2 digits - World Standard Products "
  },
  {
    name: "EAN8",
    value: "EAN8",
    info: "2 digits - shorter version of EAN13"
  },
  {
    name: "UPC",
    value: "UPC",
    info: "2 digits - American Standard Products"
  },
  {
    name: "CODE39",
    value: "CODE39",
    info: "Large characters, numbers and some marks"
  },
  {
    name: "ITF14",
    value: "ITF14",
    info: "1 digit - for packing goods"
  },
  {
    name: "MSI",
    value: "MSI",
    info: "Only numbers - for items such as warehousing"
  },
  {
    name: "MSI10",
    value: "MSI10",
    info: "MSI with MOD 10 control algorithm"
  },
  {
    name: "MSI11",
    value: "MSI11",
    info: "MSI with MOD MOD control algorithm"
  },
  {
    name: "MSI1010",
    value: "MSI1010",
    info: "MSI with two MOD control algorithms"
  },
  {
    name: "MSI1110",
    value: "MSI1110",
    info: "MSI with MOD 11 and MOD 10"
  },
  {
    name: "pharmacode",
    value: "pharmacode",
    info: "For pharmaceutical products - only 1 to 2 numbers"
  },
  {
    name: "codabar",
    value: "codabar",
    info: "For laboratory and blood bank reports"
  }
];

export const QRCodeOptionsLibs = [
  {
    name: "The size of the points",
    value: "dots"
  },
  {
    name: "Rectangle",
    value: "square"
  },
  {
    name: "Round rectangle",
    value: "extra-rounded"
  }
];

export const QRCodeDotsOptionsLibs = [
  {
    name: "square",
    value: "square"
  },
  {
    name: "Dots",
    value: "dots"
  },
  {
    name: "Rounded",
    value: "rounded"
  },
  {
    name: "Quarter",
    value: "classy"
  },
  {
    name: "Round quadruple",
    value: "classy-rounded"
  }
];

export const QRCodeCornersOptionsLibs = [
  {
    name: "square",
    value: "square"
  },
  {
    name: "Dot",
    value: "dot"
  },
  {
    name: "Rounded",
    value: "rounded"
  }
];
