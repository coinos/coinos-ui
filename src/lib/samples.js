export default {
	register: `curl "https://coinos.io/api/register" -H "content-type: application/json" -d '{
  "user": {
    "username": "demo",
    "password": "hunter2"
  }
}'`,
	login: `curl "https://coinos.io/api/login" -H "content-type: application/json" -d '{
  "username": "demo",
  "password": "hunter2"
}'`,
	payments: `curl "https://coinos.io/api/payments" 
  -H "content-type: application/json" 
  -H "Authorization: Bearer $token"
`,
	lightning: `curl "https://coinos.io/api/payments" 
  -H "content-type: application/json" 
  -H "Authorization: Bearer $token"
  -d '{
    "payreq": "lnbc1pj94d8fsp5n77k340ps4m9jn7kp8he8yynpddvurv6mcsrrqpnq5l2jxdxzlwqpp5m96pqhc5nrlk8cqsu9ufdxxa43sarp8vwf9egvm2pg9nl0zu9r8qdq2vdhkjmn0wvxqztgcqpjrzjqwhmav82kntsppmkp8jp4vg4h9nns78tsy8mg7ve4lq5txrkp0h56zlarvqqdtcqqsqqqqqqqqqqp6cq9q9qyysgqzxlypywzphyujm3ga5j5csfcmqvlnae0fgnvymkaaw94eeg7py5rqzysyjkr3ev2snq63qpsc69vf54adkd0szvmvwt5cuadjnuy95sq4xfa40"
}'`,
	bitcoin: `curl "https://coinos.io/api/payments" 
  -H "content-type: application/json" 
  -H "Authorization: Bearer $token"
  -d '{
    "amount": 5000,
    "hash": "bc1q3unh97w4rmelflrm2hvdwz37d8kray3vn4d5ca"
}'`,
	internal: `HASH=$(curl "https://coinos.io/api/invoice" 
    -H "content-type: application/json" 
    -H "Authorization: Bearer $token"
    -d '{
      "invoice": {
        "amount": 1000,
        "type": "lightning"
      },
      "user": {
        "username": "alice"
      }
  }' | jq -r '.hash');

  curl "https://coinos.io/api/payments" 
  -H "content-type: application/json" 
  -H "Authorization: Bearer $token"
  -d '{
    "amount": 5000,
    "hash": $HASH
}'`,
	rates: `curl "https://coinos.io/api/rates" 
  -H "content-type: application/json" 
}'`,
	lightningInvoice: `curl "https://coinos.io/api/invoice" 
  -H "content-type: application/json" 
  -H "Authorization: Bearer $token"
  -d '{
    "invoice": {
      "amount": 1000,
      "type": "lightning"
    }
}'`,
	bitcoinAddress: `curl "https://coinos.io/api/invoice" 
  -H "content-type: application/json" 
  -H "Authorization: Bearer $token"
  -d '{
    "invoice": {
      "amount": 3141,
      "type": "bitcoin"
    }
}'`,
	webhook: `curl "https://coinos.io/api/invoice" 
  -H "content-type: application/json" 
  -H "Authorization: Bearer $token"
  -d '{
    "invoice": {
      "type": "lightning",
      "webhook": "https://example.com/payment/received",
      "secret": "webhooksecret"
    }
}'`,
	fetchInvoice: `curl "https://coinos.io/api/invoice/bc1qmhfk9stzffhd9umzmld92vff7zg3mdlh7rvvaj" 
  -H "content-type: application/json"'`,
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
	socketAuth: `echo '{"type":"login","data":{"username":"user","password":"password"}}' | websocat -n https://coinos.io/ws`
};
