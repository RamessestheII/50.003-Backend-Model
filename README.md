# 50.003-Backend-Model
Backend, MongoDB model, for 50.003 ESC C1 I2

To run:<br />
```
npm i
node index.js
```

## Endpoints:
### Invoice Routes
+ Return a specific invoice by id:<br/>
**GET** localhost:3000/invoice?id=*invoiceid*

+ Return all invoices:<br/>
**GET** localhost:3000/invoice/all

+ Return all invoices matching filter (by Paid, Supplier and InvoiceNumber- all optional, not ordered):<br/>
**GET** localhost:3000/invoice/filter?Paid=*boolean*&Supplier=*supplierid*&InvoiceNumber=*invoicenumber*

+ Add new invoice<br/>
**POST** localhost:3000/invoice/add **_with request body in following format_**:<br/>
{<br/>
    **User: _userid_** (object id),<br/>
    **InvoiceNumber: _invoicenumber_** (string),<br/>
    Path: _filepath_ (string),<br/>
    RecPath: _receiptpath_ (string),<br/>
    **Date: _date_** (string),<br/>
    BeforeGST: _amountbeforegst_ (number),<br/>
    GST: _gst_ (number),<br/>
    Discount: _discount_ (number),<br/>
    **GrandTotal: _grandtotalamount_** (number),<br/>
    **Product: _productlist_** (JSON list: format below),<br/>
    Soa: _soaid_ (object id),<br/>
    **Supplier: _supplierid_** (object id),<br/>
}<br/>
Product list element format:<br />
{<br/>
    **Product: _productid_ (object id)**,<br/>
    **Quantity: _quantityofproduct (integer)**,<br/>
    **UnitCost: _productunitcost_ (number)**<br/>
}<br/>
^ bolded fields are required

+ Store an invoice (jpg/jpeg/pdf) to server uploads folder, send file to ML endpoint<br/>
and receive OCR-processed data along with file path in project directory:<br/>

**_While ML API is running_:**<br/>
**POST** localhost:3000/invoice/scaninv using a form with _enctype="multipart/form-data"_<br/>
and _input name="invoice"_<br/>
Expect returned data in the format {result: _jsondatafromOCR_, path: _filepath_}

+ Store a receipt (jpg/jpeg/pdf) to server uploads folder<br/>
**POST** localhost:3000/invoice/scanrec using a form with _enctype="multipart/form-data"_<br/>
and _input name="invoice"_<br/>
Expect returned data in the format {path: _filepath_}

+ Set an invoice to paid, if not currently associated with an soa:<br/>
**PUT** localhost:3000/invoice/setpaid **_with request body in following format_**:<br />
{<br/>
    id: _invoiceid_<br/>
}

+ Get invoice data as csv, filter by year/s and supplier:<br/>
**GET** localhost:3000/invoice/exportinv?Supplier=_supplierid_&startDate=_startyear_&endDate=_endyear_<br/>

+ Get product data as csv, filter by year/s and supplier:<br/>
**GET** localhost:3000/invoice/exportpdt?Supplier=_supplierid_&startDate=_startyear_&endDate=_endyear_<br />

+ Delete an invoice<br/>
**DELETE** localhost:3000/invoice/delete/_invoiceid_

## Install Dependencies:
+ Windows:<br/>
Install Image Magick from https://imagemagick.org/script/download.php#windows<br/>
Install Ghostscript from https://www.ghostscript.com/releases/gsdnld.html<br/>

+ MacOS:<br/>
Check if ghostscript and imagemagick are installed:<br/>
```
magick --version
gs --version
```
```
brew install imagemagick
brew install ghostscript
```
+ Ubuntu Linux:<br/>
```
sudo apt-get install imagemagick
```



