<h1>API Examples</h1>
<pre><code class="whitespace-pre-wrap">{`
api="https://coinos.io/api"
json="Content-Type: application/json"

username=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
password="pw"

echo Create user $username with password $password
curl -s "$api/register" -H "$json" -d '{"user": {"username": "'$username'", "password": "'$password'", "confirm": "'$password'"}}' > /dev/null
echo ""

echo Login and get an API token
token=$(curl -s "$api/taboggan" -H "$json" -d '{"username": "'$username'", "password": "'$password'"}' | jq -r .token)
echo $token
echo ""

username="apidemo"
token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFwaWRlbW8iLCJpYXQiOjE2NDAxMzIwNjd9.aBtcrnLjDS_Zixn5_X_N8sqX0KxTDrVySSqh1fa96rk"
auth="Authorization: Bearer $token"

echo Get account balance in satoshis
curl -s "$api/me" -H "$json" -H "$auth" | jq '.account.balance'
echo ""

echo Get the current price of bitcoin in USD
curl -s "$api/rates" -H "$json" | jq '.USD'
echo ""

echo Create a legacy Bitcoin address 
address=$(curl -s "$api/address?network=bitcoin&type=legacy" -H "$auth" -H "$json" | jq -r .address)
echo $address
echo ""

echo Create an invoice to associate the address with the user
curl -s "$api/invoice" -H "$json" -d '{"invoice": {"address": "'$address'", "network": "bitcoin"}, "user": {"username": "'$username'"}}' > /dev/null
echo ""

msg="testingtesting123"
echo Sign a message with the address: $msg $address
curl -s "$api/signMessage" -H "$json" -H "$auth" -d '{"address": "'$address'", "message": "'$msg'"}'
echo ""

echo Create a bech32 Bitcoin address 
address=$(curl -s "$api/address?network=bitcoin&type=bech32" -H "$auth" -H "$json" | jq -r .address)
echo $address
echo ""

echo Create a lightning invoice
text=$(curl -s "$api/lightning/invoice" -H "$auth" -H "$json" -d '{"amount": 100}')
echo $text
echo ""

echo Associate the lightning invoice with the user
curl -s "$api/invoice" -H "$json" -d '{"invoice": {"text": "'$text'", "network": "bitcoin"}, "user": {"username": "'$username'"}}' > /dev/null
echo ""

echo Get an external invoice
payreq=$(curl -s https://legend.lnbits.com/api/v1/payments -H "$json" -H "x-api-key: 698e5b6744f8442880ba3ad630756c02" -d '{ "out": false, "amount": 50, "memo": "test", "unit": "sat", "lnurl_callback": null }' | jq -r .payment_request)
echo $payreq
echo ""

echo Send a lightning payment
curl -s "$api/lightning/send" -H "$json" -H "$auth" -d '{"payreq": "'$payreq'"}' | jq -r '{ amount, fee, balance: (.account.balance)}'
echo ""

echo Send a bitcoin payment
tx=$(curl -s "$api/bitcoin/fee" -H "$json" -H "$auth" -d '{"address": "bc1qqc9azhdjjpdxenrndt8cw4tw9del5pyrjn0wln", "amount": 1200, "feeRate": 1000 }')
hex=$(echo $tx | jq -r .tx.hex)
fee=$(echo $tx | jq -r .tx.fee)

curl -s "$api/bitcoin/send" -H "$json" -H "$auth" -d '{"address": "bc1qqc9azhdjjpdxenrndt8cw4tw9del5pyrjn0wln", "tx": { "hex": "'$hex'", "fee": "'$fee'" }}' | jq -r '{ amount, fee, balance: (.account.balance)}'
echo ""
`}</code></pre>
