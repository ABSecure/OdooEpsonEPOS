# OdooEpsonEPOS
A direct Epson ePOS-Print XML interface for preparation printers.
Odoo is great. So many good features... but like all point of sale software. The developers have never used POS hardware.

Odoo can talk to printers either using an IOT box which is in itself not very good as it uses an OS print driver etc. But also for my use cases it made zero sense as you have to pay for the IOT box. Unless you use windows which I am not doing when deploying POS on tablets.

Or it can talk using the Epson ePOS-Print XML interface supported with the UB-E04, UB-R04 and bult in interface on several epson models.
Unfortunately Odoo decided to over complicate this and make some horribly messy code along the way.

They generate a HTML layout from your order. Convert that to a (horribly) rasterized image which they then send to the printer over XML... Works for many models but not the Epson U220 which is likely the most common printer to want to use.

No. Just no. If someone from Odoo is reading this please know that sending a document as an image file is horrible.

This module hacks in a more basic pure text based output. This is made from parsing the HTML output and then sending the newly formatted plain text output to the printer
It also adds colour support for the U220 and other impact models.

## Installation

Simply add the OdooEpsonEpos folder into your modules folder and activate. Any preparation printers configured to use Epson will now be printing clearer, quicker and in colour 🥳
