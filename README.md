# 50.003-Backend-Model
Backend, MongoDB model, for 50.003 ESC C1 I2

To run:<br />
```
npm i
node index.js
```

## Endpoints:
### Invoice Routes
+ Return id of specific invoice:
**GET** localhost:3000/invoice?id=*invoiceid*

+ Return all invoices:
**GET** localhost:3000/invoice/all

+ Return all invoices matching filter (by Paid, Supplier and InvoiceNumber- all optional, not ordered):
**GET** localhost:3000/invoice/filter?Paid=*boolean*&Supplier=*supplierid*&InvoiceNumber=*invoicenumber*

+ Add new invoice
**POST** localhost:3000/invoice/add **_with request body in following format_**:<br/>
{
    **User: _userid_**(object id),
    **InvoiceNumber: _invoicenumber_**(string),
    Path: _filepath_(string),
    RecPath: _recPath_(string),
    **Date: _date_**(string),
    BeforeGST: _amountbeforegst_(number),
    GST: _gst_(number),
    Discount: _discount_(number),
    GrandTotal: _grandtotalamount_(number),
    **Product: _productlist_**(JSON list: format below),
    Soa: _soaid_(object id),
    **Supplier: _supplierid_(object id)**,
}<br/>
Product list element format:<br />
{
    **Product: _productid_(object id)**,
    **Quantity: _quantityofproduct(integer)**,
    **UnitCost: _productunitcost_(number)**
}
^ bolded fields are required

+ Set an invoice to paid, if not currently associated with an soa
**PUT** localhost:3000/invoice/setpaid **_with request body in following format_**:<br />
{
    id: _invoiceid_
}

+ Delete an invoice
**DELETE** localhost:3000/invoice/delete/_invoiceid_



