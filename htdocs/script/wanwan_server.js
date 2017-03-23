Wanwan.Server = {};
Wanwan.Server.URL = "";
Wanwan.Server.Messages = [];


Wanwan.Server.Check = function() {
    for(var i = 0; i < Wanwan.Server.Messages.length; ++i) {
        console.log("From the server: " + Wanwan.Server.Messages[i]);
        console.log("(dehexed: " + Wanwan.Server.dehexify(Wanwan.Server.Messages[i]) + ")");
    }
    Wanwan.Server.Messages = [];

};





Wanwan.Server.HexLookup = [];
for(var i = 0; i < 103; ++i) Wanwan.Server.HexLookup.push(0);
Wanwan.Server.HexLookup[48] = 0;
Wanwan.Server.HexLookup[49] = 1;
Wanwan.Server.HexLookup[50] = 2;
Wanwan.Server.HexLookup[51] = 3;
Wanwan.Server.HexLookup[52] = 4;
Wanwan.Server.HexLookup[53] = 5;
Wanwan.Server.HexLookup[54] = 6;
Wanwan.Server.HexLookup[55] = 7;
Wanwan.Server.HexLookup[56] = 8;
Wanwan.Server.HexLookup[57] = 9;

Wanwan.Server.HexLookup[97] = 10;
Wanwan.Server.HexLookup[98] = 11;
Wanwan.Server.HexLookup[99] = 12;
Wanwan.Server.HexLookup[100] = 13;
Wanwan.Server.HexLookup[101] = 14;
Wanwan.Server.HexLookup[102] = 15;



Wanwan.Server.hexToUint8 = function(string) {
    return Wanwan.Server.HexLookup[string.charCodeAt(0)]*16 +
           Wanwan.Server.HexLookup[string.charCodeAt(1)];
}
Wanwan.Server.dehexify = function(string) {
    var out = "";
    for(var i = 0; i < string.length; i+=2) {
        out += String.fromCharCode(Wanwan.Server.hexToUint8(string.substring(i, i+2)));
    }
    return out;
}

