# 50.003-Backend-Model
Backend, MongoDB model, for 50.003 ESC C1 I2

To run:<br />
```
npm i
node index.js
```

## Endpoints:
### Invoice Routes
+ Return id of specific invoice:<br/>
**GET** localhost:3000/invoice?id=*invoiceid*

+ Return all invoices:<br/>
**GET** localhost:3000/invoice/all

+ Return all invoices matching filter (by Paid, Supplier and InvoiceNumber- all optional, not ordered):<br/>
**GET** localhost:3000/invoice/filter?Paid=*boolean*&Supplier=*supplierid*&InvoiceNumber=*invoicenumber*

+ Add new invoice
**POST** localhost:3000/invoice/add **_with request body in following format_**:<br/>
{<br/>
    **User: _userid_** (object id),<br/>
    **InvoiceNumber: _invoicenumber_** (string),<br/>
    Path: _filepath_ (string),<br/>
    RecPath: _recPath_ (string),<br/>
    **Date: _date_** (string),<br/>
    BeforeGST: _amountbeforegst_ (number),<br/>
    GST: _gst_ (number),<br/>
    Discount: _discount_ (number),<br/>
    GrandTotal: _grandtotalamount_ (number),<br/>
    **Product: _productlist_** (JSON list: format below),<br/>
    Soa: _soaid_ (object id),<br/>
    **Supplier: _supplierid_** (object id),<br/>
}<br/>
Product list element format:<br />
{
    **Product: _productid_ (object id)**,<br/>
    **Quantity: _quantityofproduct (integer)**,<br/>
    **UnitCost: _productunitcost_ (number)**<br/>
}<br/>
^ bolded fields are required

+ Set an invoice to paid, if not currently associated with an soa<br/>
**PUT** localhost:3000/invoice/setpaid **_with request body in following format_**:<br />
{<br/>
    id: _invoiceid_<br/>
}

+ Delete an invoice<br/>
**DELETE** localhost:3000/invoice/delete/_invoiceid_



