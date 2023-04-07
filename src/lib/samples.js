export default {
	register: `curl "https://hashme.io/api/register" -H "application/json" -d '{
  "username": "adam",
  "password": "hunter2"
}'`,
	login: `curl "https://hashme.io/api/login" -H "application/json" -d '{
  "username": "adam",
  "password": "hunter2"
}'`,
	payments: `curl "https://hashme.io/api/payments" 
  -H "application/json" 
  -H "Authorization: Bearer $token"
}'`,
	rates: `curl "https://hashme.io/api/rates" 
  -H "application/json" 
}'`,
	invoice: `curl "https://hashme.io/api/invoice" 
  -H "application/json" 
  -H "Authorization: Bearer $token"
  -d '{
    "invoice": {
      "amount": 1000,
      "type": "lightning",
      "webhook": "https://example.com/payment/received",
      "secret": "hunter2"
    },
}'`,
	fetchInvoice: `curl "https://hashme.io/api/invoice/bc1qmhfk9stzffhd9umzmld92vff7zg3mdlh7rvvaj" 
  -H "application/json"'`,
	invoiceResponse: `{
  "amount":3141
  "tip":0
  "type":"bitcoin"
  "prompt":false
  "rate":31836.9702667
  "hash":"bc1qmhfk9stzffhd9umzmld92vff7zg3mdlh7rvvaj"
  "text":"bitcoin:bc1qmhfk9stzffhd9umzmld92vff7zg3mdlh7rvvaj?amount=0.00003141"
  "currency":"CAD"
  "uid":"a9770421-3f65-11ed-9f57-0242ac2a0004"
  "received":0
  "created":1677537428134
}`,
	socketAuth: `echo '{"type":"login","data":{"username":"user","password":"password"}}' | websocat -n https://hashme.io/ws`
};
