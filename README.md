# WEBDEVPACK SDK for JavaScript (Node.js)

WEBDEVPACK SDK for JavaScript provides a simple, expressive way to integrate WEBDEVPACK’s tools into your Node.js applications. Easily access web-development utilities, automate workflows, and build faster with a unified JavaScript interface.

The SDK uses modern ES modules and native Node.js APIs (Node 20+).

## Install via npm

```shell
npm install @webdevpack/webdevpack-sdk-js
```

## Examples

```js
import { Client } from "@webdevpack/webdevpack-sdk";

const wdp = new Client({
  apiKey: "YOUR-API-KEY"
});

// IMAGES

// Optimize images
await wdp.optimizeImage(sourceFilename, targetFilename, 80);

// Convert images
await wdp.convertImage(sourceFilename, targetFilename, "webp", 80);

// Get text from image (OCR)
const result = await wdp.getTextFromImage(sourceFilename, "eng");

// Generate QR Code
await wdp.generateQRCode(text, targetFilename, 500, "webp");

// Generate barcode
await wdp.generateBarcode(text, targetFilename, 500, 300, "webp");

// CODE

// Minify JavaScript code
const jsResult = await wdp.minifyJavaScript(source);

// Minify JavaScript file
await wdp.minifyJavaScriptFile(sourceFilename, targetFilename);

// Minify CSS code
const cssResult = await wdp.minifyCSS(source);

// Minify CSS file
await wdp.minifyCSSFile(sourceFilename, targetFilename);

// WEBSITES

// Get domain WHOIS information
const result = await wdp.domainWhois(domain);

// SECURITY

// Generate password
const password = await wdp.generatePassword(length, true, true, true);

// Generate key pair
const { privateKey, publicKey } = await wdp.generateKeyPair(bits);

// DOCUMENTS

// Convert HTML to PDF
await wdp.convertHTMLToPDF(source, targetFilename);

// Convert HTML file to PDF
await wdp.convertHTMLFileToPDF(sourceFilename, targetFilename);
```

## Requirements
- Node.js 20+
- ES modules enabled ("type": "module")

## License
This project is licensed under the MIT License. See the [license file](https://github.com/webdevpack/webdevpack-sdk-php/blob/master/LICENSE) for more information.
