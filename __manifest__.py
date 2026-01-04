{
    'name': 'POS Epson Direct XML Printing',
    'version': '19.0.1.0',
    "author": "ABSecure",
    "website": "https://absecure.uk/",
    'category': 'Point of Sale',
    'summary': 'Send raw XML commands to Epson printers for preparation orders.',
    'depends': ['point_of_sale'],
    'assets': {
        'point_of_sale._assets_pos': [
            'OdooEpsonEpos/static/src/js/epson.js'
        ],
    },
    'installable': True,
    'license': 'LGPL-3',
    'price': 0.00
}
