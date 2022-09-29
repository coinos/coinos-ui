export default (text) => {
	if (!text) return;

	if (text.includes('@') && text.includes('.')) {
	  let [name, domain] = text.split('@');
	  try {
	    clearTimeout(debounce);
	    await new Promise((r) => (debounce = setTimeout(r, 1500)));
	    ({ data: text } = await Vue.axios.get(
	      `/encode?domain=${domain}&name=${name}`
	    ));
	  } catch (e) {}
	}

	  try {
	    if (text.toLowerCase().slice(0, 10) === 'lightning:')
	      text = text.slice(10);
	    let payreq = text.toLowerCase();
	    payment.payreq = payreq;
	    payment.payobj = bolt11.decode(payment.payreq);
	    let {
	      network: { bech32 },
	    } = payment.payobj;

	    if (!networks.includes('lightning'))
	      return commit('error', 'Lightning not supported in this account');

	    if (bech32 !== process.env.VUE_APP_NETWORK_BECH32) {
	      dispatch('clearPayment');
	      commit(
	        'error',
	        `Wrong network prefix '${bech32}' instead of '${process.env.VUE_APP_NETWORK_BECH32}'`
	      );
	      throw new Error('Wrong network');
	    }

	    if (user.account.ticker !== 'BTC')
	      await dispatch(
	        'shiftAccount',
	        user.accounts.find((a) => a.asset === BTC).id
	      );

	    let { tags, satoshis, millisatoshis } = payment.payobj;
	    let description = tags.find((t) => t.tagName === 'description');
	    if (description) payment.memo = description.data;
	    payment.amount = millisatoshis
	      ? Math.round(millisatoshis / 1000)
	      : satoshis;
	    payment.fiatAmount = ((payment.amount * getters.rate) / SATS).toFixed(
	      2
	    );
	    payment.network = 'lightning';

	    await Vue.axios.post('/lightning/query', { payreq });
	    if (!getters.payment.recipient)
	      go({ name: 'send', params: { keep: true } });

	    return;
	  } catch (e) {
	    if (e.response) commit('error', e.response.data);
	  }
	//
	// let url;
	// try {
	//   if (nodes.includes('bitcoin')) {
	//     url = bip21.decode(text);
	//     if (!networks.includes('bitcoin'))
	//       return commit('error', 'Bitcoin not supported in this account');
	//     payment.network = 'bitcoin';
	//     url.options.asset = BTC;
	//   }
	// } catch (e) {
	//   if (nodes.includes('liquid')) {
	//     try {
	//       url = bip21.decode(text, 'liquidnetwork');
	//       if (!networks.includes('liquid'))
	//         return commit('error', 'Liquid not supported in this account');
	//       payment.network = 'liquid';
	//     } catch (e) {
	//       /**/
	//     }
	//   }
	// }
	//
	// if (url) {
	//   let { amount, asset, assetid, message } = url.options;
	//   if (assetid) asset = assetid;
	//   if (!asset) asset = BTC;
	//   let account = user.accounts.find((a) => a.asset === asset);
	//   if (account) {
	//     if (account.asset !== user.account.asset)
	//       await dispatch('shiftAccount', account.id);
	//   } else return commit('error', 'Unrecognized asset');
	//
	//   payment.address = url.address;
	//
	//   if (message) payment.memo = message;
	//
	//   if (amount) {
	//     payment.amount = parseInt((amount * SATS).toFixed(0));
	//     payment.fiatAmount = ((payment.amount * getters.rate) / SATS).toFixed(
	//       2
	//     );
	//   }
	//
	//   await dispatch('isInternal');
	//   await dispatch('estimateFee');
	//   go({ name: 'send', params: { keep: true } });
	//   return;
	// }
	//
	// if (nodes.includes('bitcoin') && validate(text)) {
	//   if (!networks.includes('bitcoin'))
	//     return commit('error', 'Bitcoin not supported in this account');
	//   payment.address = text;
	//   payment.network = 'bitcoin';
	//   await dispatch('isInternal');
	//   go({ name: 'send', params: { keep: true } });
	//   return;
	// }
	//
	// // Liquid
	// if (nodes.includes('liquid') && isLiquid(text)) {
	//   if (!networks.includes('liquid'))
	//     return commit('error', 'Liquid not supported in this account');
	//   payment.address = text;
	//   payment.network = 'liquid';
	//   await dispatch('isInternal');
	//   go({ name: 'send', params: { keep: true } });
	//   return;
	// }
	//
	// if (text.startsWith('6P')) {
	//   commit('text', text);
	//   return go('/decrypt');
	// }
	//
	// try {
	//   let ecpair = ECPair.fromWIF(text, {
	//     ...this._vm.$network,
	//     confidentialPrefix: 1,
	//     assetHash: '',
	//   });
	//   commit('ecpair', ecpair);
	//   go('/sweep');
	// } catch (e) {
	//   /* */
	// }
	//
	// if (text.toLowerCase().startsWith('lnurl:')) {
	//   try {
	//     const { data: lnurl } = await Vue.axios.get(`/url?code=${text}`);
	//     await dispatch('handleScan', lnurl);
	//     return;
	//   } catch (e) {
	//     commit('error', e.response ? e.response.data : e.message);
	//   }
	// }
	//
	// if (text.toLowerCase().includes('lnurl')) {
	//   commit('loading', true);
	//   let txt = text.toLowerCase().match(/lnurl[a-z0-9]+/);
	//
	//   try {
	//     const { data: params } = await Vue.axios.get(`/decode?text=${txt}`);
	//     if (params.status === 'ERROR') {
	//       let { reason } = params;
	//       try {
	//         ({ reason } = JSON.parse(reason.replace(/.*{/, '{')));
	//       } catch {
	//         /**/
	//       }
	//
	//       commit('loading', false);
	//       return commit('error', reason);
	//     }
	//
	//     let { seed } = getters;
	//
	//     switch (params.tag) {
	//       case 'channelRequest':
	//         await dispatch('openChannel', params);
	//         break;
	//       case 'login':
	//         if (!seed) ({ seed } = await dispatch('passwordPrompt'));
	//         try {
	//           const key = linkingKey(params.domain, seed);
	//           const signedMessage = secp256k1.ecdsaSign(
	//             hexToUint8Array(params.k1),
	//             key.privateKey
	//           );
	//           const signedMessageDER = secp256k1.signatureExport(
	//             signedMessage.signature
	//           );
	//           const linkingKeyPub = secp256k1.publicKeyCreate(
	//             key.privateKey,
	//             true
	//           );
	//           const sig = bytesToHexString(signedMessageDER);
	//
	//           const response = await Vue.axios.post('/login', {
	//             params,
	//             sig,
	//             key: bytesToHexString(linkingKeyPub),
	//           });
	//
	//           if (response.data.status === 'OK') {
	//             commit('snack', 'Login success');
	//           } else {
	//             commit('error', response.status);
	//           }
	//
	//           go('/home');
	//         } catch (e) {
	//           commit('error', e.response ? e.response.data : e.message);
	//         }
	//         break;
	//
	//       case 'withdrawRequest':
	//         commit('lnurl', params);
	//         go('/withdraw');
	//         break;
	//       case 'payRequest':
	//         commit('lnurl', params);
	//         go('/pay');
	//         break;
	//     }
	//   } catch (e) {
	//     commit('error', e.response ? e.response.data : e.message);
	//   }
	//
	//   commit('loading', false);
	// }
	//
	// if (isUuid(text)) {
	//   try {
	//     const { data: payment } = await Vue.axios.post('/checkRedeemCode', {
	//       redeemcode: text,
	//     });
	//
	//     if (payment) {
	//       window.location.href = `${window.location.protocol}//${window.location.host}/redeem/${text}`;
	//       return;
	//     }
	//   } catch (e) {
	//     commit('error', e.response ? e.response.data : e.message);
	//   }
	//
	//   try {
	//     const { data: invoice } = await Vue.axios.get(
	//       `/invoice?uuid=${text}`
	//     );
	//     await dispatch('handleScan', invoice.text);
	//     return;
	//   } catch (e) {
	//     commit('error', e.response ? e.response.data : e.message);
	//   }
	// }
	//
	// if (
	//   text.startsWith(
	//     `${window.location.protocol}//${window.location.host}/redeem`
	//   )
	// ) {
	//   window.location.href = text;
	// }
	//
	// commit('stopScanning', true);
	//
	// return 'no';
};
