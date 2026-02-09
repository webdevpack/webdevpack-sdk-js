/*
 * WEBDEVPACK SDK for JavaScript (Node.js)
 * https://github.com/webdevpack/webdevpack-sdk-js
 * Copyright (c) Amplilabs Ltd.
 * MIT License
 */

import fs from "node:fs";
import path from "node:path";

export class Client {
    #options = {};

    constructor(options = {}) {
        this.#options = options;
    }

    async #sendRequest(pathname, data = {}, method = "POST", isJSON = true) {
        const url = "https://api.webdevpack.com" + pathname;

        const headers = {};
        if (this.#options.apiKey) {
            headers["WDP-API-Key"] = this.#options.apiKey;
        }

        let body;

        if (method === "POST") {
            if (isJSON) {
                headers["Content-Type"] = "application/json";
                body = JSON.stringify(data);
            } else {
                body = data;
            }
        }

        const response = await fetch(url, {
            method,
            headers,
            body
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        if (method === "GET") {
            return { result: await response.arrayBuffer() };
        }

        const text = await response.text();
        let parsed;

        try {
            parsed = JSON.parse(text);
        } catch {
            throw new Error(`Unknown error: ${text}`);
        }

        if (parsed?.status === "ok") {
            return parsed;
        }

        if (parsed?.status === "error") {
            const [type, arg] = (parsed.code || "").split(":");

            if (type === "missingArgument") {
                throw new Error(`Missing argument: ${arg}`);
            }
            if (type === "invalidArgument") {
                throw new Error(`Invalid argument: ${arg}`);
            }
            if (parsed.message) {
                throw new Error(`Error: ${parsed.message}`);
            }
        }

        throw new Error(`Unknown error: ${text}`);
    }

    async #uploadFile(filename) {
        const form = new FormData();
        form.append("file", new Blob([fs.readFileSync(filename)]), path.basename(filename));
        const response = await this.#sendRequest("/v0/upload", form, "POST", false);
        return response.file;
    }

    async #downloadFile(fileID, targetFilename) {
        const response = await this.#sendRequest(`/v0/download/${fileID}`, {}, "GET", false);
        const buffer = Buffer.from(response.result);
        if (!buffer.length) {
            throw new Error("Download error: file empty");
        }
        this.#makeDir(path.dirname(targetFilename));
        fs.writeFileSync(targetFilename, buffer);
    }

    #makeDir(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    #checkSourceFilename(filename) {
        if (!fs.existsSync(filename)) {
            throw new Error(`The source file (${filename}) does not exist!`);
        }
        fs.accessSync(filename, fs.constants.R_OK);
    }

    #checkTargetFilename(filename) {
        if (fs.existsSync(filename)) {
            fs.accessSync(filename, fs.constants.W_OK);
        } else {
            fs.accessSync(path.dirname(filename), fs.constants.W_OK);
        }
    }

    async transformText(text, transform) {
        const r = await this.#sendRequest("/v0/text-transform", { text, transform });
        return r.result.text;
    }

    async #base64(text, transform) {
        const r = await this.#sendRequest("/v0/base64-encode-decode", { text, transform });
        return r.result.text;
    }

    base64Encode(text) {
        return this.#base64(text, "encode");
    }

    base64Decode(text) {
        return this.#base64(text, "decode");
    }

    async hashText(text, algorithm) {
        const r = await this.#sendRequest("/v0/text-hash", { text, algorithm });
        return r.result.text;
    }

    async encodeURL(url) {
        const r = await this.#sendRequest("/v0/url-encode-decode", { text: url, transform: "encode" });
        return r.result.text;
    }

    async decodeURL(url) {
        const r = await this.#sendRequest("/v0/url-encode-decode", { text: url, transform: "decode" });
        return r.result.text;
    }

    async domainWhois(domain) {
        const r = await this.#sendRequest("/v0/domain-whois", { domain });
        return r.result.raw;
    }

    async optimizeImage(source, target, quality = 100) {
        this.#checkSourceFilename(source);
        this.#checkTargetFilename(target);
        const fileID = await this.#uploadFile(source);
        const r = await this.#sendRequest("/v0/image-optimize", { file: fileID, quality });
        await this.#downloadFile(r.result.file, target);
    }

    async convertImage(source, target, format, quality = 100) {
        this.#checkSourceFilename(source);
        this.#checkTargetFilename(target);
        const fileID = await this.#uploadFile(source);
        const r = await this.#sendRequest("/v0/image-convert", { file: fileID, format, quality });
        await this.#downloadFile(r.result.file, target);
    }

    async getTextFromImage(source, language = "eng") {
        this.#checkSourceFilename(source);
        const fileID = await this.#uploadFile(source);
        const r = await this.#sendRequest("/v0/text-from-image", { file: fileID, language });
        return r.result.text;
    }

    async generateQRCode(text, target, size, format) {
        this.#checkTargetFilename(target);
        const r = await this.#sendRequest("/v0/qrcode", { text, size, format });
        await this.#downloadFile(r.result.file, target);
    }

    async generateBarcode(text, target, width, height, format) {
        this.#checkTargetFilename(target);
        const r = await this.#sendRequest("/v0/barcode", { text, width, height, format });
        await this.#downloadFile(r.result.file, target);
    }

    async minifyJavaScript(code) {
        const r = await this.#sendRequest("/v0/js-minify-text", { text: code });
        return r.result.text;
    }

    async minifyJavaScriptFile(source, target) {
        this.#checkSourceFilename(source);
        this.#checkTargetFilename(target);
        const fileID = await this.#uploadFile(source);
        const r = await this.#sendRequest("/v0/js-minify-file", { file: fileID });
        await this.#downloadFile(r.result.file, target);
    }

    async minifyCSS(code) {
        const r = await this.#sendRequest("/v0/css-minify-text", { text: code });
        return r.result.text;
    }

    async minifyCSSFile(source, target) {
        this.#checkSourceFilename(source);
        this.#checkTargetFilename(target);
        const fileID = await this.#uploadFile(source);
        const r = await this.#sendRequest("/v0/css-minify-file", { file: fileID });
        await this.#downloadFile(r.result.file, target);
    }

    async #json(text, transform) {
        const r = await this.#sendRequest("/v0/json-encode-decode", { text, transform });
        return r.result.text;
    }

    encodeJSON(text) {
        return this.#json(text, "encode");
    }

    decodeJSON(text) {
        return this.#json(text, "decode");
    }

    async generatePassword(length, includeUpperCase, includeSymbols, includeNumbers) {
        const r = await this.#sendRequest("/v0/password", {
            length,
            uppercase: includeUpperCase,
            symbols: includeSymbols,
            numbers: includeNumbers
        });
        return r.result.password;
    }

    async generateKeyPair(bits) {
        const r = await this.#sendRequest("/v0/keypair", { bits });
        return {
            privateKey: r.result.privateKey,
            publicKey: r.result.publicKey
        };
    }

    async convertHTMLToPDF(code, target) {
        this.#checkTargetFilename(target);
        const r = await this.#sendRequest("/v0/html-to-pdf", { text: code });
        await this.#downloadFile(r.result.file, target);
    }

    async convertHTMLFileToPDF(source, target) {
        this.#checkSourceFilename(source);
        this.#checkTargetFilename(target);
        const fileID = await this.#uploadFile(source);
        const r = await this.#sendRequest("/v0/html-file-to-pdf", { file: fileID });
        await this.#downloadFile(r.result.file, target);
    }
}
