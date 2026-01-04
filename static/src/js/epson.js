/** @odoo-module */

import { BasePrinter } from "@point_of_sale/app/utils/printer/base_printer";
import { patch } from "@web/core/utils/patch";

patch(BasePrinter.prototype, {
    /**
     * @override
     * @param {Object} receipt - The receipt data (Order lines, totals, etc.)
     * @param {String} receiptId - Unique ID for the receipt
     */
    async printReceipt(receipt, receiptId) {
        if (this.address) {
            // 1. Parse the HTML string into a DOM document
            const parser = new DOMParser();
            const doc = parser.parseFromString(receipt.innerHTML, 'text/html');
            console.log(receipt.innerHTML);
            // 2. Extract specific data using selectors
            const orderName = doc.querySelector('.pos-receipt-title')?.innerText || "New Order";
            const orderLines = doc.querySelectorAll('.orderline');
            const employee = doc.querySelector('.o-employee-name');
            const state = doc.querySelector('.pos-receipt-body').querySelector('.pos-receipt-title')?.innerText || "New?";
            const customer = doc.querySelector('.my-4')?.innerText || "Hicup";
            const guests = doc.querySelector('.pos-customer-info')?.innerText || "Guests: 42";
            const course = doc.querySelector('.pb-1')?.innerText || "";

            let linesXml = "";
            orderLines.forEach(line => {
                // Extracting name and qty from the HTML structure
                const name = line.querySelector('.product-name')?.innerText || "";
                const qty = line.querySelector('.me-3')?.innerText || "";
                const mods = line.querySelectorAll('.m-0');
                const notes = line.querySelectorAll('.fst-italic');
                
                if (name) {
                    linesXml += `<text color="color_1" ul="false" dh="true" dw="false" align="left">${qty.trim()} x ${name.trim()}\n</text>`;
                }
                if(mods) {
                    mods.forEach(mod => {
                        linesXml += `<text color="color_2" dh="true" dw="false" ul="false">${mod.innerText}\n</text>`;
                    });
                    
                }
                if(notes) {
                    console.log(notes);
                    notes.forEach(note => {
                        linesXml += `<text color="color_2" dh="true" dw="false" ul="true"> - ${note.innerText}\n</text>`;
                    });
                    
                }
            });

            // 3. Fallback: If no structured lines found, get all text
            if (!linesXml) {
                linesXml = `<text>${doc.querySelector('.pos-receipt-body').querySelectorAll('.text-center')[1].innerText}</text>`;
            }

            const xmlBody = `
                <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
                    <s:Body>
                        <epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
                            <text font="font_a" color="color_1" dw="false" dh="false" width="1" height="1" align="left" ul="false"/>
                            <text color="color_1" smooth="true" dh="true" dw="true" align="center">${state}\n</text>
                            <text color="color_1" smooth="true" dh="true" dw="true" align="center">${orderName}\n</text>
                            text font="font_a" color="color_1" />
                            <text color="color_1" dw="false" dh="false" width="1" height="1" align="left" smooth="true">${employee.childNodes[0].innerText}\n</text>
                            <text color="color_1" dw="false" dh="false" width="1" height="1" align="left" smooth="true">${employee.childNodes[2].innerText}\n</text>
                            <text color="color_1" dw="true" dh="false" align="left" smooth="true">${customer}\n</text>
                            <text color="color_1" dw="true" dh="false" align="left" smooth="true">${guests}\n</text>
                            <text color="color_1" dw="false" dh="false" width="1" height="1" align="center" smooth="true">--------------------------------\n</text>
                            <text color="color_1" dw="true" dh="false" align="center" smooth="true">${course}\n</text>
                            ${linesXml}
                            <feed line="3"/>
                            <cut type="feed"/>
                        </epos-print>
                    </s:Body>
                </s:Envelope>
            `;

            try {
                const response = await fetch(`${this.address}`,     {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': '""' },
                    body: xmlBody,
                    signal: AbortSignal.timeout(60000)
                });

                if (!response.ok) return { successful: false };

                // --- NEW: PARSE PRINTER STATUS RESPONSE ---
                const responseText = await response.text();
                console.log(responseText);
                const resDoc = parser.parseFromString(responseText, 'text/xml');
                const eposPrintElement = resDoc.getElementsByTagName('response')[0];
                
                // The printer returns <response success="true/false" ... />
                const successAttr = eposPrintElement?.getAttribute('success');

                if (successAttr === 'true') {
                    return { successful: true };
                } else {
                    const errorCode = eposPrintElement?.getAttribute('code');
                    console.error("Printer responded but failed to print. Code:", errorCode);
                    return { 
                        successful: false, 
                        message: { 
                            title: "Printer Error", 
                            body: `The printer returned an error: ${errorCode}. Please check paper and cover.` 
                        } 
                    };
                }
            } catch (error) {
                console.error("Network/CORS error reaching printer:", error);
                return { 
                    successful: false, 
                    message: { title: "Connection Failed", body: "Could not reach the printer at " + this.address } 
                };
            }
        }

        return super.printReceipt(...arguments);
    }
});
