export default {
	register: `curl "https://coinos.io/api/register" -H "application/json" -d '{
  "username": "adam",
  "password": "hunter2"
}'`,
	login: `curl "https://coinos.io/api/login" -H "application/json" -d '{
  "username": "adam",
  "password": "hunter2"
}'`,
	invoice: `curl "https://coinos.io/api/invoice" 
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
	fetchInvoice: `curl "https://coinos.io/api/invoice/bc1qmhfk9stzffhd9umzmld92vff7zg3mdlh7rvvaj" 
  -H "application/json"'`
};
