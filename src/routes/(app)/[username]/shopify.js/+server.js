export async function GET({ cookies, params, url }) {
	let { username } = params;

	let js = `
var qrcode=function(r,_){var t=r,e=QRErrorCorrectLevel[_],n=null,$=0,o=null,a=[],f={},i=function(r,_){n=function(r){for(var _=Array(r),t=0;t<r;t+=1){_[t]=Array(r);for(var e=0;e<r;e+=1)_[t][e]=null}return _}($=4*t+17),u(0,0),u($-7,0),u(0,$-7),l(),g(),v(r,_),t>=7&&h(r),null==o&&(o=x(t,e,a)),s(o,_)},u=function(r,_){for(var t=-1;t<=7;t+=1)if(!(r+t<=-1)&&!($<=r+t))for(var e=-1;e<=7;e+=1)_+e<=-1||$<=_+e||(0<=t&&t<=6&&(0==e||6==e)||0<=e&&e<=6&&(0==t||6==t)||2<=t&&t<=4&&2<=e&&e<=4?n[r+t][_+e]=!0:n[r+t][_+e]=!1)},c=function(){for(var r=0,_=0,t=0;t<8;t+=1){i(!0,t);var e=QRUtil.getLostPoint(f);(0==t||r>e)&&(r=e,_=t)}return _},g=function(){for(var r=8;r<$-8;r+=1)null==n[r][6]&&(n[r][6]=r%2==0);for(var _=8;_<$-8;_+=1)null==n[6][_]&&(n[6][_]=_%2==0)},l=function(){for(var r=QRUtil.getPatternPosition(t),_=0;_<r.length;_+=1)for(var e=0;e<r.length;e+=1){var $=r[_],o=r[e];if(null==n[$][o])for(var a=-2;a<=2;a+=1)for(var f=-2;f<=2;f+=1)-2==a||2==a||-2==f||2==f||0==a&&0==f?n[$+a][o+f]=!0:n[$+a][o+f]=!1}},h=function(r){for(var _=QRUtil.getBCHTypeNumber(t),e=0;e<18;e+=1){var o=!r&&(_>>e&1)==1;n[Math.floor(e/3)][e%3+$-8-3]=o}for(var e=0;e<18;e+=1){var o=!r&&(_>>e&1)==1;n[e%3+$-8-3][Math.floor(e/3)]=o}},v=function(r,_){for(var t=QRUtil.getBCHTypeInfo(e<<3|_),o=0;o<15;o+=1){var a=!r&&(t>>o&1)==1;o<6?n[o][8]=a:o<8?n[o+1][8]=a:n[$-15+o][8]=a}for(var o=0;o<15;o+=1){var a=!r&&(t>>o&1)==1;o<8?n[8][$-o-1]=a:o<9?n[8][15-o-1+1]=a:n[8][15-o-1]=a}n[$-8][8]=!r},s=function(r,_){for(var t=-1,e=$-1,o=7,a=0,f=QRUtil.getMaskFunction(_),i=$-1;i>0;i-=2)for(6==i&&(i-=1);;){for(var u=0;u<2;u+=1)if(null==n[e][i-u]){var c=!1;a<r.length&&(c=(r[a]>>>o&1)==1),f(e,i-u)&&(c=!c),n[e][i-u]=c,-1==(o-=1)&&(a+=1,o=7)}if((e+=t)<0||$<=e){e-=t,t=-t;break}}},d=function(r,_){for(var t=0,e=0,n=0,$=Array(_.length),o=Array(_.length),a=0;a<_.length;a+=1){var f=_[a].dataCount,i=_[a].totalCount-f;e=Math.max(e,f),n=Math.max(n,i),$[a]=Array(f);for(var u=0;u<$[a].length;u+=1)$[a][u]=255&r.getBuffer()[u+t];t+=f;var c=QRUtil.getErrorCorrectPolynomial(i),g=qrPolynomial($[a],c.getLength()-1).mod(c);o[a]=Array(c.getLength()-1);for(var u=0;u<o[a].length;u+=1){var l=u+g.getLength()-o[a].length;o[a][u]=l>=0?g.getAt(l):0}}for(var h=0,u=0;u<_.length;u+=1)h+=_[u].totalCount;for(var v=Array(h),s=0,u=0;u<e;u+=1)for(var a=0;a<_.length;a+=1)u<$[a].length&&(v[s]=$[a][u],s+=1);for(var u=0;u<n;u+=1)for(var a=0;a<_.length;a+=1)u<o[a].length&&(v[s]=o[a][u],s+=1);return v},x=function(r,_,t){for(var e=QRRSBlock.getRSBlocks(r,_),n=qrBitBuffer(),$=0;$<t.length;$+=1){var o=t[$];n.put(o.getMode(),4),n.put(o.getLength(),QRUtil.getLengthInBits(o.getMode(),r)),o.write(n)}for(var a=0,$=0;$<e.length;$+=1)a+=e[$].dataCount;if(n.getLengthInBits()>8*a)throw Error("code length overflow. ("+n.getLengthInBits()+">"+8*a+")");for(n.getLengthInBits()+4<=8*a&&n.put(0,4);n.getLengthInBits()%8!=0;)n.putBit(!1);for(;!(n.getLengthInBits()>=8*a)&&(n.put(236,8),!(n.getLengthInBits()>=8*a));){;n.put(17,8)}return d(n,e)};return f.addData=function(r){var _=qr8BitByte(r);a.push(_),o=null},f.isDark=function(r,_){if(r<0||$<=r||_<0||$<=_)throw Error(r+","+_);return n[r][_]},f.getModuleCount=function(){return $},f.make=function(){i(!1,c())},f.createTableTag=function(r,_){r=r||2;var t="";t+='<table style="',t+=" border-width: 0px; border-style: none;",t+=" border-collapse: collapse;",t+=" padding: 0px; margin: "+(_=void 0===_?4*r:_)+"px;",t+='">',t+="<tbody>";for(var e=0;e<f.getModuleCount();e+=1){t+="<tr>";for(var n=0;n<f.getModuleCount();n+=1)t+='<td style="',t+=" border-width: 0px; border-style: none;",t+=" border-collapse: collapse;",t+=" padding: 0px; margin: 0px;",t+=" width: "+r+"px;",t+=" height: "+r+"px;",t+=" background-color: ",t+=f.isDark(e,n)?"#000000":"#ffffff",t+=";",t+='"/>';t+="</tr>"}return t+="</tbody>",t+="</table>"},f.createImgTag=function(r,_,t){r=r||2;var e=_=void 0===_?4*r:_,n=f.getModuleCount()*r+_;return createImgTag(t,t,function(_,t){if(!(e<=_)||!(_<n)||!(e<=t)||!(t<n))return 1;var $=Math.floor((_-e)/r),o=Math.floor((t-e)/r);return f.isDark(o,$)?0:1})},f};qrcode.stringToBytes=function(r){for(var _=[],t=0;t<r.length;t+=1){var e=r.charCodeAt(t);_.push(255&e)}return _},qrcode.createStringToBytes=function(r,_){var t=function(){for(var t=base64DecodeInputStream(r),e=function(){var r=t.read();if(-1==r)throw Error();return r},n=0,$={};;){var o=t.read();if(-1==o)break;var a=e(),f=e(),i=e(),u=String.fromCharCode(o<<8|a),c=f<<8|i;$[u]=c,n+=1}if(n!=_)throw Error(n+" != "+_);return $}();return function(r){for(var _=[],e=0;e<r.length;e+=1){var n=r.charCodeAt(e);if(n<128)_.push(n);else{var $=t[r.charAt(e)];"number"==typeof $?(255&$)==$?_.push($):(_.push($>>>8),_.push(255&$)):_.push(63)}}return _}};var QRMode={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},QRErrorCorrectLevel={L:1,M:0,Q:3,H:2},QRMaskPattern={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},QRUtil=function(){var r=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],_={},t=function(r){for(var _=0;0!=r;)_+=1,r>>>=1;return _};return _.getBCHTypeInfo=function(r){for(var _=r<<10;t(_)-t(1335)>=0;)_^=1335<<t(_)-t(1335);return(r<<10|_)^21522},_.getBCHTypeNumber=function(r){for(var _=r<<12;t(_)-t(7973)>=0;)_^=7973<<t(_)-t(7973);return r<<12|_},_.getPatternPosition=function(_){return r[_-1]},_.getMaskFunction=function(r){switch(r){case QRMaskPattern.PATTERN000:return function(r,_){return(r+_)%2==0};case QRMaskPattern.PATTERN001:return function(r,_){return r%2==0};case QRMaskPattern.PATTERN010:return function(r,_){return _%3==0};case QRMaskPattern.PATTERN011:return function(r,_){return(r+_)%3==0};case QRMaskPattern.PATTERN100:return function(r,_){return(Math.floor(r/2)+Math.floor(_/3))%2==0};case QRMaskPattern.PATTERN101:return function(r,_){return r*_%2+r*_%3==0};case QRMaskPattern.PATTERN110:return function(r,_){return(r*_%2+r*_%3)%2==0};case QRMaskPattern.PATTERN111:return function(r,_){return(r*_%3+(r+_)%2)%2==0};default:throw Error("bad maskPattern:"+r)}},_.getErrorCorrectPolynomial=function(r){for(var _=qrPolynomial([1],0),t=0;t<r;t+=1)_=_.multiply(qrPolynomial([1,QRMath.gexp(t)],0));return _},_.getLengthInBits=function(r,_){if(1<=_&&_<10)switch(r){case QRMode.MODE_NUMBER:return 10;case QRMode.MODE_ALPHA_NUM:return 9;case QRMode.MODE_8BIT_BYTE:case QRMode.MODE_KANJI:return 8;default:throw Error("mode:"+r)}else if(_<27)switch(r){case QRMode.MODE_NUMBER:return 12;case QRMode.MODE_ALPHA_NUM:return 11;case QRMode.MODE_8BIT_BYTE:return 16;case QRMode.MODE_KANJI:return 10;default:throw Error("mode:"+r)}else if(_<41)switch(r){case QRMode.MODE_NUMBER:return 14;case QRMode.MODE_ALPHA_NUM:return 13;case QRMode.MODE_8BIT_BYTE:return 16;case QRMode.MODE_KANJI:return 12;default:throw Error("mode:"+r)}else throw Error("type:"+_)},_.getLostPoint=function(r){for(var _=r.getModuleCount(),t=0,e=0;e<_;e+=1)for(var n=0;n<_;n+=1){for(var $=0,o=r.isDark(e,n),a=-1;a<=1;a+=1)if(!(e+a<0)&&!(_<=e+a))for(var f=-1;f<=1;f+=1)!(n+f<0)&&!(_<=n+f)&&(0!=a||0!=f)&&o==r.isDark(e+a,n+f)&&($+=1);$>5&&(t+=3+$-5)}for(var e=0;e<_-1;e+=1)for(var n=0;n<_-1;n+=1){var i=0;r.isDark(e,n)&&(i+=1),r.isDark(e+1,n)&&(i+=1),r.isDark(e,n+1)&&(i+=1),r.isDark(e+1,n+1)&&(i+=1),(0==i||4==i)&&(t+=3)}for(var e=0;e<_;e+=1)for(var n=0;n<_-6;n+=1)r.isDark(e,n)&&!r.isDark(e,n+1)&&r.isDark(e,n+2)&&r.isDark(e,n+3)&&r.isDark(e,n+4)&&!r.isDark(e,n+5)&&r.isDark(e,n+6)&&(t+=40);for(var n=0;n<_;n+=1)for(var e=0;e<_-6;e+=1)r.isDark(e,n)&&!r.isDark(e+1,n)&&r.isDark(e+2,n)&&r.isDark(e+3,n)&&r.isDark(e+4,n)&&!r.isDark(e+5,n)&&r.isDark(e+6,n)&&(t+=40);for(var u=0,n=0;n<_;n+=1)for(var e=0;e<_;e+=1)r.isDark(e,n)&&(u+=1);return t+10*(Math.abs(100*u/_/_-50)/5)},_}(),QRMath=function(){for(var r=Array(256),_=Array(256),t=0;t<8;t+=1)r[t]=1<<t;for(var t=8;t<256;t+=1)r[t]=r[t-4]^r[t-5]^r[t-6]^r[t-8];for(var t=0;t<255;t+=1)_[r[t]]=t;var e={};return e.glog=function(r){if(r<1)throw Error("glog("+r+")");return _[r]},e.gexp=function(_){for(;_<0;)_+=255;for(;_>=256;)_-=255;return r[_]},e}();function qrPolynomial(r,_){if(void 0===r.length)throw Error(r.length+"/"+_);var t=function(){for(var t=0;t<r.length&&0==r[t];)t+=1;for(var e=Array(r.length-t+_),n=0;n<r.length-t;n+=1)e[n]=r[n+t];return e}(),e={};return e.getAt=function(r){return t[r]},e.getLength=function(){return t.length},e.multiply=function(r){for(var _=Array(e.getLength()+r.getLength()-1),t=0;t<e.getLength();t+=1)for(var n=0;n<r.getLength();n+=1)_[t+n]^=QRMath.gexp(QRMath.glog(e.getAt(t))+QRMath.glog(r.getAt(n)));return qrPolynomial(_,0)},e.mod=function(r){if(e.getLength()-r.getLength()<0)return e;for(var _=QRMath.glog(e.getAt(0))-QRMath.glog(r.getAt(0)),t=Array(e.getLength()),n=0;n<e.getLength();n+=1)t[n]=e.getAt(n);for(var n=0;n<r.getLength();n+=1)t[n]^=QRMath.gexp(QRMath.glog(r.getAt(n))+_);return qrPolynomial(t,0).mod(r)},e}var QRRSBlock=function(){var r=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],_=function(r,_){var t={};return t.totalCount=r,t.dataCount=_,t},t={},e=function(_,t){switch(t){case QRErrorCorrectLevel.L:return r[(_-1)*4+0];case QRErrorCorrectLevel.M:return r[(_-1)*4+1];case QRErrorCorrectLevel.Q:return r[(_-1)*4+2];case QRErrorCorrectLevel.H:return r[(_-1)*4+3];default:return}};return t.getRSBlocks=function(r,t){var n=e(r,t);if(void 0===n)throw Error("bad rs block @ typeNumber:"+r+"/errorCorrectLevel:"+t);for(var $=n.length/3,o=[],a=0;a<$;a+=1)for(var f=n[3*a+0],i=n[3*a+1],u=n[3*a+2],c=0;c<f;c+=1)o.push(_(i,u));return o},t}(),qrBitBuffer=function(){var r=[],_=0,t={};return t.getBuffer=function(){return r},t.getAt=function(_){return(r[Math.floor(_/8)]>>>7-_%8&1)==1},t.put=function(r,_){for(var e=0;e<_;e+=1)t.putBit((r>>>_-e-1&1)==1)},t.getLengthInBits=function(){return _},t.putBit=function(t){var e=Math.floor(_/8);r.length<=e&&r.push(0),t&&(r[e]|=128>>>_%8),_+=1},t},qr8BitByte=function(r){for(var _=QRMode.MODE_8BIT_BYTE,t=r,e=[],n={},$=0,o=t.length;$<o;$++){var a=[],f=t.charCodeAt($);f>65536?(a[0]=240|(1835008&f)>>>18,a[1]=128|(258048&f)>>>12,a[2]=128|(4032&f)>>>6,a[3]=128|63&f):f>2048?(a[0]=224|(61440&f)>>>12,a[1]=128|(4032&f)>>>6,a[2]=128|63&f):f>128?(a[0]=192|(1984&f)>>>6,a[1]=128|63&f):a[0]=f,e.push(a)}(e=Array.prototype.concat.apply([],e)).length!=t.length&&(e.unshift(191),e.unshift(187),e.unshift(239));var i=e;return n.getMode=function(){return _},n.getLength=function(r){return i.length},n.write=function(r){for(var _=0;_<i.length;_+=1)r.put(i[_],8)},n},byteArrayOutputStream=function(){var r=[],_={};return _.writeByte=function(_){r.push(255&_)},_.writeShort=function(r){_.writeByte(r),_.writeByte(r>>>8)},_.writeBytes=function(r,t,e){t=t||0,e=e||r.length;for(var n=0;n<e;n+=1)_.writeByte(r[n+t])},_.writeString=function(r){for(var t=0;t<r.length;t+=1)_.writeByte(r.charCodeAt(t))},_.toByteArray=function(){return r},_.toString=function(){var _="";_+="[";for(var t=0;t<r.length;t+=1)t>0&&(_+=","),_+=r[t];return _+"]"},_},base64EncodeOutputStream=function(){var r=0,_=0,t=0,e="",n={},$=function(r){e+=String.fromCharCode(o(63&r))},o=function(r){if(r<0);else if(r<26)return 65+r;else if(r<52)return 97+(r-26);else if(r<62)return 48+(r-52);else if(62==r)return 43;else if(63==r)return 47;throw Error("n:"+r)};return n.writeByte=function(e){for(r=r<<8|255&e,_+=8,t+=1;_>=6;)$(r>>>_-6),_-=6},n.flush=function(){if(_>0&&($(r<<6-_),r=0,_=0),t%3!=0)for(var n=3-t%3,o=0;o<n;o+=1)e+="="},n.toString=function(){return e},n},base64DecodeInputStream=function(r){var _=r,t=0,e=0,n=0,$={};$.read=function(){for(;n<8;){if(t>=_.length){if(0==n)return -1;throw Error("unexpected end of file./"+n)}var r=_.charAt(t);if(t+=1,"="==r)return n=0,-1;!r.match(/^\s$/)&&(e=e<<6|o(r.charCodeAt(0)),n+=6)}var $=e>>>n-8&255;return n-=8,$};var o=function(r){if(65<=r&&r<=90)return r-65;if(97<=r&&r<=122)return r-97+26;if(48<=r&&r<=57)return r-48+52;if(43==r)return 62;if(47==r)return 63;else throw Error("c:"+r)};return $},gifImage=function(r,_){var t=r,e=_,n=Array(r*_),$={};$.setPixel=function(r,_,e){n[_*t+r]=e},$.write=function(r){r.writeString("GIF87a"),r.writeShort(t),r.writeShort(e),r.writeByte(128),r.writeByte(0),r.writeByte(0),r.writeByte(0),r.writeByte(0),r.writeByte(0),r.writeByte(255),r.writeByte(255),r.writeByte(255),r.writeString(","),r.writeShort(0),r.writeShort(0),r.writeShort(t),r.writeShort(e),r.writeByte(0);var _=a(2);r.writeByte(2);for(var n=0;_.length-n>255;)r.writeByte(255),r.writeBytes(_,n,255),n+=255;r.writeByte(_.length-n),r.writeBytes(_,n,_.length-n),r.writeByte(0),r.writeString(";")};var o=function(r){var _=r,t=0,e=0,n={};return n.write=function(r,n){if(r>>>n!=0)throw Error("length over");for(;t+n>=8;)_.writeByte(255&(r<<t|e)),n-=8-t,r>>>=8-t,e=0,t=0;e=r<<t|e,t+=n},n.flush=function(){t>0&&_.writeByte(e)},n},a=function(r){for(var _=1<<r,t=(1<<r)+1,e=r+1,$=f(),a=0;a<_;a+=1)$.add(String.fromCharCode(a));$.add(String.fromCharCode(_)),$.add(String.fromCharCode(t));var i=byteArrayOutputStream(),u=o(i);u.write(_,e);var c=0,g=String.fromCharCode(n[c]);for(c+=1;c<n.length;){var l=String.fromCharCode(n[c]);c+=1,$.contains(g+l)?g+=l:(u.write($.indexOf(g),e),4095>$.size()&&($.size()==1<<e&&(e+=1),$.add(g+l)),g=l)}return u.write($.indexOf(g),e),u.write(t,e),u.flush(),i.toByteArray()},f=function(){var r={},_=0,t={};return t.add=function(e){if(t.contains(e))throw Error("dup key:"+e);r[e]=_,_+=1},t.size=function(){return _},t.indexOf=function(_){return r[_]},t.contains=function(_){return void 0!==r[_]},t};return $},createImgTag=function(r,_,t,e){for(var n=gifImage(r,_),$=0;$<_;$+=1)for(var o=0;o<r;o+=1)n.setPixel(o,$,t(o,$));var a=byteArrayOutputStream();n.write(a);for(var f=base64EncodeOutputStream(),i=a.toByteArray(),u=0;u<i.length;u+=1)f.writeByte(i[u]);f.flush();var c="";return c+="data:image/gif;base64,",c+=f},drawImg=function(r,_){var t,e=(_=_||{}).typeNumber||4,n=_.errorCorrectLevel||"M",$=_.size||500;try{(t=qrcode(e,n||"M")).addData(r),t.make()}catch(o){if(!(e>=40))return drawImg(r,{size:$,errorCorrectLevel:n,typeNumber:e+1});throw Error("Text too long to encode")}var a=parseInt($/t.getModuleCount()),f=parseInt(($-t.getModuleCount()*a)/2);return t.createImgTag(a,f,$)};


window.addEventListener('load', async () => {
  let sleep = (n) => new Promise((r) => setTimeout(r, n));
  let wait = async (f, n = 100, s = 300) => {
    let i = 0;
    while (!(await f()) && i < s) (await sleep(n)) && i++;
    if (i >= s) throw new Error('timeout');
    return f();
  };

  await wait(() => ["coinos", "bitcoin", "btc", "btcpayserver", "btcpay server"].filter(value => document.querySelector(".payment-method-list__item__info").innerText.toLowerCase().indexOf(value) !== -1).length === 0);

	let sat = (s) => {
		s = Math.abs(s);
		let p = Math.floor(Math.log(s) / Math.LN10 + 0.000000001);
		let d = Math.floor((p + 1) / 3);

		return (
			'⚡️' +
			(parseInt(s) > 0
				? new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(
						s / Math.pow(1000, d)
				  ) + ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z'][d]
				: 0
			).toString()
		);
	};

	let copy = (text) => {
		navigator.clipboard.writeText(text);
	};

	let f = (s, currency) =>
		new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency
		})
			.format(s)
			.replace('CA', '');

	let s = (s) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(s);

	let base64 = drawImg('test', { size: 300 });

	let link = document.createElement('link');
	link.setAttribute('rel', 'stylesheet');
	link.setAttribute('type', 'text/css');
	link.setAttribute(
		'href',
		'https://fonts.googleapis.com/css?family=Public+Sans:400italic,400,300,700'
	);

	var style = document.createElement('style');
	style.innerHTML = \`#check {
        transform: scale(0.5);
        transition: transform 1s;
      }
    \`;
	document.head.appendChild(style);

	document.head.appendChild(link);
	document.title = 'Pay With Bitcoin';

	let fiat = Shopify.checkout.payment_due;
	let main = document.querySelector('main');
	main.style.fontFamily = 'Public Sans, sans-serif';
	main.innerHTML = 'Please Pay';

	let data = await fetch('${url.protocol}//${url.host}/api/invoice', {
		method: 'POST',
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			accept: 'application/json',
		},
		body: JSON.stringify({
			invoice: {
				fiat,
				type: 'lightning',
				webhook: \`${url.protocol}//${url.host}/api/shopify/\${Shopify.checkout.order_id}\`
			},
			user: { username: '${username}' }
		})
	})
		.then(function (response) {
			return response.json();
		})
		.catch(console.log);

	main.innerHTML = \`<a href="lightning:\${data.hash}">
      <div style="display: flex; margin-top: 50px; margin-bottom: 80px; position: relative;">
        <img id="qrcode" src="\${base64}" />
        <div id="bg"></div>
      </div>
    </a>
    <div style="width: 100%; text-align: center; ">
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 12px;">\${f(
				(data.amount * data.rate) / 100000000,
				data.currency
			)}</div>
      <div style="color: #666; font-size: 18px;">\${sat(data.amount)}</div>
    </div>
    <div style="text-align: center; margin: 40px auto; max-width: 460px; word-break: break-all; line-height: 1.5rem">\${
			data.hash
		}</div>
    <div style="margin: 20px 0; display: flex; gap: 1rem; justify-content: center; align-items: center;">
      <a href="lightning:\${data.hash}" style="text-decoration: none">
      <div style="color: #999; font-size: 18px; border-radius: 9999px; padding: 0.5rem 1rem; border: 1px solid #ccc; background: white;">Open</div>
      </a>

      <a id="copy" href="#" style="text-decoration: none">
      <div style="color: #999; font-size: 18px; border-radius: 9999px; padding: 0.5rem 1rem; border: 1px solid #ccc; background: white;">Copy</div></a>
    </div>
    \`;

	let copyButton = document.getElementById('copy');
	copyButton.addEventListener('click', (e) => {
		e.preventDefault();
		copy(data.hash);
		let copied = document.createElement('div');
		copied.textContent = 'Copied!';
		main.appendChild(copied);
		setTimeout(() => copied.remove(), 3000);
	});

	let qr = document.getElementById('qrcode');
	qr.style.margin = 'auto';
	qr.style.marginTop = '40px';
	qr.style.border = '12px white solid';
	qr.style.zIndex = 10;

	new QRCode(qr, data.hash);

	let bg = document.getElementById('bg');
	bg.style.position = 'absolute';
	bg.style.margin = 'auto';
	bg.style.left = '0';
	bg.style.right = '0';
	bg.style.width = '400px';
	bg.style.height = '400px';
	bg.style.borderRadius = '50%';
	bg.style.background = 'linear-gradient(to right, #F2F6FC, #E1E3FF)';
	bg.style.zIndex = '0';

	let ws = new WebSocket('wss://dev.coinos.io/ws');
	ws.onmessage = ({ data }) => {
		try {
			let { type, data: d } = JSON.parse(data);
			if (type === 'payment') {
				main.innerHTML =
					'<img id="check" src="${url.protocol}//${url.host}/icons/check.svg" alt="Check" />' +
					\`<h1>Payment received!</h1>
            <h2>
            \${((d.amount * d.rate) / 100000000).toFixed(2)} CAD
            </h2>
            <h3>
            ⚡️\${d.amount}
            </h3>\`;

				var image = document.getElementById('check');
				image.addEventListener('load', function () {
					image.style.transform = 'scale(1)';
				});
			}
		} catch (e) {
			console.log(e);
		}
	};
	ws.onopen = () => {
		ws.send(JSON.stringify({ type: 'subscribe', data }));
	};
});
  `;

	return new Response(js, {
		headers: {
			'Content-Type': 'application/javascript'
		}
	});
}
