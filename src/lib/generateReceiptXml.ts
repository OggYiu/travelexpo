export function generateReceiptXml(
  title: string,
  subtitle: string,
  qrData: string,
  instructions: string[]
): string {
  const instructionsXml = instructions
    .map(instruction => `<text>${instruction}&#10;</text>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
  <text align="center" size="2">${title}&#10;</text>
  <text align="center" size="1">${subtitle}&#10;&#10;</text>
  
  <qrcode align="center" level="M" width="3">${qrData}</qrcode>
  <text>&#10;</text>
  
  <text>排隊須知：&#10;</text>
  ${instructionsXml}
  
  <text>&#10;</text>
  <text align="center">謝謝您的配合！&#10;</text>
  
  <cut type="feed"/>
</epos-print>`;
}
